function fish_prompt
    # Son komut durumu
    set -l last_status $status

    # Ayırıcı çizgi (renk geçişli)
    set -l gradient (set_color cyan)"╭─"(string repeat -n (math $COLUMNS - 3) "─")(set_color normal)
    echo $gradient

    # İlk satır: Kullanıcı, host ve dizin
    set -l user_segment (set_color -o brcyan)" "$USER(set_color normal)
    set -l host_segment (set_color -o brblue)" "(prompt_hostname)(set_color normal)
    set -l dir_segment (set_color -o blue)" "(prompt_pwd)(set_color normal)
    
    # İkinci satır: Git durumu ve zaman
    set -l git_info
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1
        set branch (git branch --show-current 2>/dev/null)
        set dirty (git status --porcelain 2>/dev/null)
        
        set git_info " "(set_color -o white)" "(set_color -o yellow)"$branch"
        if test -n "$dirty"
            set git_info "$git_info "(set_color -o red)""
        else
            set git_info "$git_info "(set_color -o green)""
        end
    end
    
    set -l time_segment (set_color -o magenta)" "(date "+%H:%M")(set_color normal)
    
    # Durum göstergesi
    set -l status_indicator
    if test $last_status -ne 0
        set status_indicator (set_color -o red)" $last_status"
    else
        set status_indicator (set_color -o green)""
    end
    
    # Prompt sembolü
    set -l prompt_symbol (set_color -o yellow)" "
    
    # Tüm bileşenleri yazdır
    echo -n -s $user_segment " " $host_segment " " $dir_segment
    echo -n -s $git_info " " $time_segment
    echo -n -s "  " $status_indicator
    echo ""
    echo -n -s (set_color cyan)"╰─" $prompt_symbol
end
