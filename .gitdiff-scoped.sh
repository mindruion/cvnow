#!/bin/bash
# Git diff scoped to current directory
# Usage: source this file, then use: git-scoped-diff

function git-scoped-diff() {
    # Get the current directory relative to git root
    REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
    
    if [ -z "$REPO_ROOT" ]; then
        echo "Not in a git repository"
        return 1
    fi
    
    # Get current directory relative to repo root
    CURRENT_DIR=${PWD#${REPO_ROOT}/}
    
    # If we're already at repo root, just use normal git diff
    if [ "$CURRENT_DIR" = "$PWD" ] || [ "$CURRENT_DIR" = "" ]; then
        git diff "$@"
    else
        # Scope to current directory
        git diff "$@" -- "$CURRENT_DIR"
    fi
}

function git-scoped-status() {
    # Get the current directory relative to git root
    REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
    
    if [ -z "$REPO_ROOT" ]; then
        echo "Not in a git repository"
        return 1
    fi
    
    # Get current directory relative to repo root
    CURRENT_DIR=${PWD#${REPO_ROOT}/}
    
    # If we're already at repo root, just use normal git status
    if [ "$CURRENT_DIR" = "$PWD" ] || [ "$CURRENT_DIR" = "" ]; then
        git status "$@"
    else
        # Scope to current directory
        git status "$@" -- "$CURRENT_DIR"
    fi
}

