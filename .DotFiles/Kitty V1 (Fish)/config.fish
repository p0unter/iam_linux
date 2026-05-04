if status is-interactive
    # Commands to run in interactive sessions can go here
function fish_greeting
    # Renkli saat ve tarih formatı
    set time (set_color -o cyan)(date "+%H:%M:%S")(set_color normal)
    set date (set_color -o yellow)(date "+%d/%m/%Y")(set_color normal)
    
    # Özel mesaj
    set stars (set_color brwhite)"⋆ ˚｡⋆୨୧˚"(set_color normal)
    echo (set_color -o red)"$stars"(set_color normal)
    echo (set_color -o green)"⏱️  Time: $time 📅 Date: $date"(set_color normal)
    echo (set_color -o red)"$stars"(set_color normal)
end
# Daha iyi bir hostname gösterimi
function prompt_hostname
    # Kısa hostname (domain olmadan)
    hostname -s
end

# Git prompt'u özelleştirme
set -g __fish_git_prompt_showdirtystate 1
set -g __fish_git_prompt_showuntrackedfiles 1
set -g __fish_git_prompt_showupstream auto
set -g __fish_git_prompt_char_stateseparator " "

# Git sembolleri
set -g __fish_git_prompt_char_dirtystate '✚'
set -g __fish_git_prompt_char_cleanstate '✔'
set -g __fish_git_prompt_char_untrackedfiles '…'
set -g __fish_git_prompt_char_stagedstate '●'
set -g __fish_git_prompt_char_upstream_ahead '↑'
set -g __fish_git_prompt_char_upstream_behind '↓'
end
