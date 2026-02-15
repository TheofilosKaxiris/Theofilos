# Greedy Ideas Pipeline — fully automated, project-agnostic
# Runs 4 prompts in sequence: AI examines project, generates ideas, picks 2, writes plan, then implements it
# Usage: .\prompts\run-greedy-pipeline.ps1

$ErrorActionPreference = "Stop"
Push-Location (Split-Path $PSScriptRoot -Parent)  # project root (parent of prompts/)

function Invoke-ClaudeStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StepName,
        [Parameter(Mandatory = $true)]
        [string]$Prompt,
        [Parameter(Mandatory = $true)]
        [string]$AllowedTools
    )

    $claudeOutput = claude -p $Prompt --allowedTools $AllowedTools --output-format stream-json --verbose 2>&1
    $limitRegex = '(?i)(rate.?limit|quota|max budget|budget exceeded|context window|max.?tokens|token limit|usage limit)'
    $resultEvent = $null

    foreach ($line in $claudeOutput) {
        if ($line -isnot [string]) {
            Write-Host "[$StepName] $line"
            continue
        }

        $trimmedLine = $line.Trim()
        if (-not $trimmedLine.StartsWith("{")) {
            Write-Host "[$StepName] $line"
            continue
        }

        try {
            $event = $trimmedLine | ConvertFrom-Json -Depth 100
        }
        catch {
            Write-Host "[$StepName] $line"
            continue
        }

        if ($event.type -eq "assistant" -and $event.message.content) {
            foreach ($contentItem in $event.message.content) {
                if ($contentItem.type -eq "tool_use") {
                    $toolInput = ($contentItem.input | ConvertTo-Json -Compress)
                    if ($toolInput.Length -gt 180) {
                        $toolInput = "$($toolInput.Substring(0, 180))..."
                    }

                    Write-Host "[$StepName] AI tool: $($contentItem.name) $toolInput"
                }
                elseif ($contentItem.type -eq "thinking" -and $contentItem.thinking) {
                    $thinkingText = $contentItem.thinking -replace '\r?\n', ' '
                    if ($thinkingText.Length -gt 220) {
                        $thinkingText = "$($thinkingText.Substring(0, 220))..."
                    }

                    Write-Host "[$StepName] AI thinking: $thinkingText"
                }
                elseif ($contentItem.type -eq "text" -and $contentItem.text) {
                    $assistantText = $contentItem.text -replace '\r?\n', ' '
                    if ($assistantText.Length -gt 220) {
                        $assistantText = "$($assistantText.Substring(0, 220))..."
                    }

                    Write-Host "[$StepName] AI output: $assistantText"
                }
            }
        }
        elseif ($event.type -eq "result") {
            $resultEvent = $event
        }
    }

    if ($LASTEXITCODE -ne 0) {
        $limitLine = $claudeOutput | Where-Object { $_ -is [string] -and $_ -match $limitRegex } | Select-Object -First 1
        if ($limitLine) {
            Write-Host "[$StepName] Limit reached: $limitLine" -ForegroundColor Yellow
        }

        throw "[$StepName] Claude failed with exit code $LASTEXITCODE."
    }

    if ($null -ne $resultEvent -and $null -ne $resultEvent.usage) {
        $cost = if ($null -ne $resultEvent.total_cost_usd) { [math]::Round([double]$resultEvent.total_cost_usd, 6) } else { 0 }
        Write-Host ("[{0}] Usage: input={1}, output={2}, cost=${3}" -f $StepName, $resultEvent.usage.input_tokens, $resultEvent.usage.output_tokens, $cost)

        $modelInfo = $null
        if ($null -ne $resultEvent.modelUsage) {
            $modelInfo = $resultEvent.modelUsage.PSObject.Properties | Select-Object -First 1
        }

        if ($null -ne $modelInfo -and $null -ne $modelInfo.Value.maxOutputTokens -and $null -ne $resultEvent.usage.output_tokens) {
            $maxOutputTokens = [double]$modelInfo.Value.maxOutputTokens
            $outputTokens = [double]$resultEvent.usage.output_tokens
            $outputPercent = if ($maxOutputTokens -gt 0) { [math]::Round(($outputTokens / $maxOutputTokens) * 100, 2) } else { 0 }
            Write-Host "[$StepName] Output token usage: $([int]$outputTokens)/$([int]$maxOutputTokens) ($outputPercent`%)"

            if ($outputTokens -ge $maxOutputTokens) {
                Write-Host "[$StepName] Limit reached: model output token cap was hit." -ForegroundColor Yellow
            }
        }
    }

    $limitSeen = $claudeOutput | Where-Object { $_ -is [string] -and $_ -match $limitRegex } | Select-Object -First 1
    if ($limitSeen) {
        Write-Host "[$StepName] Limit warning detected: $limitSeen" -ForegroundColor Yellow
    }
    else {
        Write-Host "[$StepName] Limit check: no limit warning detected."
    }

    return $resultEvent
}

try {
    $Prompts = "prompts"

    # Find next run number across both idea and build files
    $ideaRuns = Get-ChildItem -Path $Prompts -File -Filter "expand-greedy-ideas-*.md" | ForEach-Object {
        if ($_.BaseName -match '^expand-greedy-ideas-(\d+)$') { [int]$Matches[1] }
    }
    $buildRuns = Get-ChildItem -Path $Prompts -File -Filter "build-greedy-*.md" | ForEach-Object {
        if ($_.BaseName -match '^build-greedy-(\d+)$') { [int]$Matches[1] }
    }
    $allRuns = @(@($ideaRuns) + @($buildRuns) | Where-Object { $_ -is [int] })
    $Run = if ($allRuns.Count -gt 0) { (($allRuns | Measure-Object -Maximum).Maximum + 1) } else { 1 }

    $IdeasFile = "$Prompts/expand-greedy-ideas-$Run.md"
    $BuildFile = "$Prompts/build-greedy-$Run.md"

    Write-Host "=== Run #$Run ==="
    Write-Host ""

    Write-Host "=== Step 1: Examine project and generate greedy ideas ==="
    $expandPrompt = Get-Content "$Prompts/expand-greedy.md" -Raw
    $step1Prompt = @"
$expandPrompt

First, explore this project's codebase thoroughly — read key files, understand the stack, the domain, existing features, and what's missing. Then generate 10 greedy feature ideas tailored to this specific project and write them to $IdeasFile following the format described above.
"@
    $null = Invoke-ClaudeStep -StepName "Step 1" -Prompt $step1Prompt -AllowedTools "Read,Write,Glob,Grep,Bash"

    Write-Host ""
    Write-Host "=== Step 2: AI picks 2 best ideas ==="
    $step2Prompt = @"
Read $IdeasFile.

You must pick exactly 2 ideas to implement. Choose the 2 that:
- Have the highest visible impact for end users
- Are feasible given the project's current tech stack and architecture
- Can realistically be built as min-version in 1-2 days each

Output ONLY the idea numbers in this exact format (nothing else):
idea3, idea7
"@
    $step2Result = Invoke-ClaudeStep -StepName "Step 2" -Prompt $step2Prompt -AllowedTools "Read"
    if ($null -eq $step2Result -or [string]::IsNullOrWhiteSpace($step2Result.result)) {
        throw "Step 2 did not return idea selection output."
    }

    # Clean whitespace and extract idea numbers
    $Chosen = ($step2Result.result -replace '\s', '') | Select-String -Pattern 'idea\d+(,idea\d+)*' | ForEach-Object { $_.Matches.Value }
    if ([string]::IsNullOrWhiteSpace($Chosen)) {
        throw "Step 2 returned output but no valid idea list was found."
    }
    Write-Host "AI chose: $Chosen"

    Write-Host ""
    Write-Host "=== Step 3: Generate implementation plan ==="
    $implementPrompt = Get-Content "$Prompts/implement-greedy-ideas.md" -Raw
    $step3Prompt = @"
$implementPrompt

The selected ideas are: $Chosen
Read the ideas from $IdeasFile, assess each selected idea, then write the implementation file to $BuildFile as described.
"@
    $null = Invoke-ClaudeStep -StepName "Step 3" -Prompt $step3Prompt -AllowedTools "Read,Write,Glob,Grep,Bash"
    if (-not (Test-Path $BuildFile)) {
        throw "Step 3 did not create build file: $BuildFile"
    }
    if ([string]::IsNullOrWhiteSpace((Get-Content $BuildFile -Raw))) {
        throw "Step 3 created an empty build file: $BuildFile"
    }

    Write-Host ""
    Write-Host "=== Step 4: Implement the build plan in code ==="
    $step4Prompt = @"
Read $BuildFile and implement the selected ideas in this repository now.

Requirements:
- Apply concrete code changes (create/update files) to fully implement the minimum viable versions.
- Follow the existing HTML/CSS/vanilla JS patterns used in this project.
- Run the existing validation commands/tests that apply after making changes.
- Finish with a brief summary of changed files and validation commands run.
"@
    $null = Invoke-ClaudeStep -StepName "Step 4" -Prompt $step4Prompt -AllowedTools "Read,Edit,Write,Glob,Grep,Bash"

    Write-Host ""
    Write-Host "=== Pipeline complete (Run #$Run) ==="
    Write-Host "Ideas file:  $IdeasFile"
    Write-Host "Selected:    $Chosen"
    Write-Host "Build plan:  $BuildFile"
    Write-Host "Implementation: Applied by Step 4"
}
finally {
    Pop-Location
}
