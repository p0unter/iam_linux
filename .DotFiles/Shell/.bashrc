#
# ~/.bashrc - Enhanced shell configuration
#

# ============================================================================
# Early Exit for Non-Interactive Shells
# ============================================================================
[[ $- != *i* ]] && return

# ============================================================================
# Color Utility Function
# ============================================================================
colors() {
	local fgc bgc vals seq0
	printf "Color escapes are %s\n" '\e[${value};...;${value}m'
	printf "Values 30..37 are \e[33mforeground colors\e[m\n"
	printf "Values 40..47 are \e[43mbackground colors\e[m\n"
	printf "Value  1 gives a  \e[1mbold-faced look\e[m\n\n"

	for fgc in {30..37}; do
		for bgc in {40..47}; do
			fgc=${fgc#37}
			bgc=${bgc#40}
			vals="${fgc:+$fgc;}${bgc}"
			vals=${vals%%;}
			seq0="${vals:+\e[${vals}m}"
			printf "  %-9s" "${seq0:-(default)}"
			printf " ${seq0}TEXT\e[m"
			printf " \e[${vals:+${vals+$vals;}}1mBOLD\e[m"
		done
		echo; echo
	done
}

# ============================================================================
# Bash Completion
# ============================================================================
[[ -r /usr/share/bash-completion/bash_completion ]] && \
	. /usr/share/bash-completion/bash_completion

# ============================================================================
# Terminal Window Title Configuration
# ============================================================================
case ${TERM} in
	xterm*|rxvt*|Eterm*|aterm|kterm|gnome*|interix|konsole*)
		PROMPT_COMMAND='echo -ne "\033]0;${USER}@${HOSTNAME%%.*}:${PWD/#$HOME/\~}\007"'
		;;
	screen*)
		PROMPT_COMMAND='echo -ne "\033_${USER}@${HOSTNAME%%.*}:${PWD/#$HOME/\~}\033\\"'
		;;
esac

# ============================================================================
# Color Support Detection
# ============================================================================
use_color=true
safe_term=${TERM//[^[:alnum:]]/?}
match_lhs=""

[[ -f ~/.dir_colors ]] && match_lhs="${match_lhs}$(<~/.dir_colors)"
[[ -f /etc/DIR_COLORS ]] && match_lhs="${match_lhs}$(</etc/DIR_COLORS)"
[[ -z ${match_lhs} ]] && type -P dircolors >/dev/null && \
	match_lhs=$(dircolors --print-database)
[[ $'\n'${match_lhs} == *$'\n'"TERM "${safe_term}* ]] && use_color=true

# ============================================================================
# Prompt Configuration
# ============================================================================
if ${use_color}; then
	# Configure dircolors
	if type -P dircolors >/dev/null; then
		if [[ -f ~/.dir_colors ]]; then
			eval $(dircolors -b ~/.dir_colors)
		elif [[ -f /etc/DIR_COLORS ]]; then
			eval $(dircolors -b /etc/DIR_COLORS)
		fi
	fi

	# Enhanced single-line prompt
	if [[ ${EUID} == 0 ]]; then
		# Root prompt - bold red with danger indicator
		PS1='\[\033[01;31m\]\h\[\033[01;36m\] \W\[\033[01;31m\] #\[\033[00m\] '
	else
		# User prompt - clean single-line design
		PS1='\[\033[01;32m\]\u\[\033[01;37m\]@\[\033[01;32m\]\h \[\033[01;36m\]\W\[\033[01;37m\] ₺\[\033[00m\] '
	fi

	# Colorized commands
	alias ls='ls --color=auto --group-directories-first'
	alias grep='grep --colour=auto'
	alias egrep='egrep --colour=auto'
	alias fgrep='fgrep --colour=auto'
else
	# Fallback for non-color terminals
	if [[ ${EUID} == 0 ]]; then
		PS1='\u@\h \W \$ '
	else
		PS1='\u@\h \w \$ '
	fi
fi

unset use_color safe_term match_lhs

# ============================================================================
# Enhanced Aliases
# ============================================================================
# Safety aliases
alias cp='cp -i'
alias mv='mv -i'
alias rm='rm -i'

# Improved listings
alias ll='ls -lAh'
alias la='ls -A'
alias l='ls -CF'

# System info
alias df='df -h'
alias du='du -h'
alias free='free -h'

# Navigation shortcuts
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Better defaults
alias mkdir='mkdir -pv'
alias more='less'

# Quick edit
alias bashrc='${EDITOR:-nano} ~/.bashrc'
alias reload='source ~/.bashrc && echo "Bashrc reloaded!"'

# ============================================================================
# Shell Options
# ============================================================================
shopt -s checkwinsize    # Update LINES and COLUMNS after each command
shopt -s expand_aliases  # Enable alias expansion
shopt -s histappend      # Append to history file, don't overwrite
shopt -s cmdhist         # Save multi-line commands as one history entry
shopt -s cdspell         # Autocorrect typos in path names with cd
shopt -s dirspell        # Autocorrect directory names during completion

# ============================================================================
# History Configuration
# ============================================================================
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups  # Ignore duplicates and commands starting with space
HISTTIMEFORMAT="%F %T "           # Add timestamp to history

# ============================================================================
# X11 Configuration
# ============================================================================
xhost +local:root >/dev/null 2>&1

# ============================================================================
# PATH Configuration
# ============================================================================
# LM Studio CLI
export PATH="$PATH:/home/yaga/.lmstudio/bin"

# ============================================================================
# Welcome Message (Optional - uncomment to enable)
# ============================================================================
# echo -e "\e[1;36m╔════════════════════════════════════════╗\e[0m"
# echo -e "\e[1;36m║\e[0m  Welcome back, \e[1;32m${USER}\e[0m!                  \e[1;36m║\e[0m"
# echo -e "\e[1;36m╚════════════════════════════════════════╝\e[0m"
# echo ""

# cowsay -f default "I lost my..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# opencode
export PATH=/home/yaga/.opencode/bin:$PATH

export PATH=$PATH:/home/yaga/.spicetify


# Load Angular CLI autocompletion.
source <(ng completion script)

# Pacman Lastest Package Downloads Check
function pac-log {
    # Usage: pac-log [n=20]
    #    show persisting installs/removes in last n lines of pacman.log (install X...remove X pairs and the converse are filtered out)
    {
        if [[ -e /var/log/pacman.log.1 ]]; then
            cat /var/log/pacman.log.1
        elif [[ -e /var/log/pacman.log.1.gz ]]; then
            zcat /var/log/pacman.log.1.gz
        fi
        cat /var/log/pacman.log
    } | grep -E '] (installed|removed)' | python <(cat << EOF
import sys, re
pkgre = re.compile(r'\[[^]]*\] (?:\[[A-Z]+\] )?(installed|removed) ([^ ]*) .*')
lines = []
hist = {
    'installed': {},
    'removed': {},
}
otheract = {
    'installed': 'removed',
    'removed': 'installed',
}
li = 0
for l in sys.stdin:
    m = pkgre.match(l)
    if m:
        act, pkg = m.groups()
        hist[act].setdefault(pkg, []).append(li)
        lines.append((li, act, pkg, l.strip()))
        li += 1

for li, act, pkg, line in lines:
    # Check if this is the absolute final state recorded for this package
    is_last_state = (li == hist[act][pkg][-1])
    
    # Check if a counter-action occurred later down the line
    other_indices = hist[otheract[act]].get(pkg, [])
    has_counter_action_later = any(oi > li for oi in other_indices)
    
    if is_last_state and not has_counter_action_later:
        print(line)
EOF
) | tail -n "${1-20}"
}



