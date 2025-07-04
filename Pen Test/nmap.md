# Cheat Sheet

```bash
nmap -p80,443,445 -sV -O --osscan-guess 192.168.1.10-50 -T4
nmap 192.168.1.15 # single ip scan
nmap 192.168.1.15 192.168.1.52 # more ip scan
nmap 192.168.1.1-254 # ip range defination
nmap 192.168.1.0/24 # with net mask
nmap abc.com # with domain
nmap -iL target.txt # with file
nmap -iR # host range
nmap --exculude 192.168.1.22 # exclude ip scanning
nmap 192.168.1.0/24 -n # without dns scanning
nmap 192.168.1.0/24 -sn # Scanning without port and name resolution.
nmap 192.168.1.0/24 -PR # Arp packet ping scan
nmap 192.168.1.0/24 -Pn # without ping and only port scanning
nmap 192.168.1.0/24 -PA # ping scanning with TCP & ACK flags
```

### PORT
```bash
nmap 192.168.1.10 -sT # TCP port scanning
nmap 192.168.1.10 -sS # TCP port scanning with SYN flag (For fast sacanning)
nmap 192.168.1.10 -sU # UDP port scanning
nmap 192.168.1.10 -p 21-100 # specific port range scanning
nmap 192.168.1.10 -p U:53,T:21-25,80 # specific port range scanning (for TCP/UDP)
nmap 192.168.1.10 -p- # all ports scanning
nmap 192.168.1.10 -p http,fpt # scanning with service name
nmap 192.168.1.10 -F # quickly scanning 100 port
nmap 192.168.1.10 --top-ports 1000 # top ports scanning
```

### VULNERABILITY SCANNING
```bash
nmap 192.168.1.10 -sV # scan service running on port
nmap 192.168.1.10 -sV --verion-intensity 8 # 8th precision version scanning between 0-9
nmap 192.168.1.10 -sV --verion-light # light and fast version scanning
nmap 192.168.1.10 --version-all # highest level 9th version scanning
```

### OS SCANNING
```bash
nmap 192.168.1.1 -O # OS scanning (with TCP/IP fingerprint)
nmap 192.168.1.1 -O --osscan-limit # Scanning for targets with TCP ports
nmap 192.168.1.1 -O --osscan-guess # More aggressive scanning
nmap 192.168.1.1 -O --max-os-tries 1 # once scanning
nmap 192.168.1.1 -A # OS and Vulnerabilty scanning (aggressive)
```

### SCRIPT
```bash
nmap 192.168.1.1 -sC # scanning with most known scripts
nmap 192.168.1.1 --script http-sql-injection # scan with specific script
nmap 192.168.1.1 --script smb* # scanning with all of the specific scripts
nmap --script snmp-sysdescr --script-args snmpcommunity=admin 192.168.1.1 # throw arguments
nmap 192.168.1.1 --script vuln # with all script scanning
```

### INTRUSION DETECTION SYSTEM (FIREWALL EVESION)
```bash
nmap 192.168.1.1 -f # throw fragmented IP packets
nmap 192.168.1.1 --mtu 16 # scanning with change packet size
nmap -D RND:10 # scanning with random 10 decoy IP
nmap -D 192.168.1.5,192.168.1.6,192.168.1.7 192.168.1.1 # specific spoof ip scanning
nmap -S www.microsoft.com www.facebook.com # spoof source scanning
nmap -g 53 192.168.1.1 # scanning at specific source port number
nmap --proxies http://192.168.1.50:8080,http://192.168.1.20:80 192.168.1.1 # scanning with proxy
nmap --data-lenght 25 192.168.1.1 # randomly append 25 byte from the send packages
```

### NSE (NMAP SCRIPT ENGINE)
```bash
nmap --script-updatedb
ls -l /usr/share/nmap/scripts/
ls -l /usr/share/nmap/scripts/ | grep http
locate *.nse
locate *http*.nse
nmap --script-help nbstat
```
### NET BIOS DISCOVERY WITH NSE
```bash
nmap --script nbstat 10.10.10.11-12
```

### SMB (SERVER MESSAGE BLOCK) ENUMERATION AND NSE
```bash
nmap --script smb-os-discovery 10.10.10.11 -p445
nmap --script smb-security-mode 10.10.10.11 -p445
nmap --script smb-brute 10.10.10.11 -p445
nmap --script smb-enum-users 10.10.10.11 -p445 -d
nmap --script smb-enum-shares 10.10.10.11 -p445
nmap --script smb-enum-shares --script-args smbuser=administrator,smbpass='' 10.10.10.11 -p445
smbclient -L 10.10.10.11 -N
smbclient -L \\\\10.10.10.11\\IPC$
smbclient -L \\\\10.10.10.11\\C$ # connection
nmap --script smb-vuln-ms16-010 10.10.10.11
```

### MYSQL ENUMERATION WITH NSE
```bash
nmap 10.10.10.11 -p3306 --script mysql-info
nmap 10.10.10.11 -p3306 --script mysql-enum # users
nmap 10.10.10.11 -p3306 --script mysql-empty-password
nmap 10.10.10.11 -p3306 --script mysql-user --script-args mysqluser=root
nmap 10.10.10.11 -p3306 --script mysql-brute -d # mysql bruteforce attack
nmap 10.10.10.11 -p3306 --script mysql-databases --script-args userdb="/root/Desktop users.txt" -d
nmap 10.10.10.11 -p3306 --script mysql-databases --script-args mysqluser=root -d
```

### SSH ENUMERATION WITH NSE
```bash
nmap -p22 10.10.10.11-12 --script banner # learn ssh version
nmap -p22 10.10.10.11-12 --script ssh-auth-methods
nmap -p22 10.10.10.11-12 --script ssh2-enum-algos
nmap -p22 10.10.10.11-12 --script ssh-hostkey
nmap -p22 10.10.10.11-12 --script ssh-hostkey --script-args ssh_hostkey=full
nmap -p22 10.10.10.11-12 --script ssh-publickey-acceptance -d # attack
nmap -p22 10.10.10.11-12 --script ssh-brute
```

### HTTP ENUMERATION WITH NSE
```bash
nmap -p- 10.10.10.11-12 -T4 -sV # scanning
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-methods
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-apache-server-status,http-date
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-auth-finder,http-backup-finder,http-config-backup
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-security-headers
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-slowloris-check -d
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-userdir-enum -d
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-errors -d
nmap -p 8020,8022,8080,8282,8585,80,443 10.10.10.11-12 -T4 -sV --script http-vuln* -d
```

### VULNERABILITY CVE DETECTION WITH NSE (VULN, VULNERS)
```bash
nmap 10.10.10.11-12 -p- -sV -T4 -vvv -oN result.txt --script vuln
nmap 10.10.10.11-12 -p- -sV -T4 -vvv -oN result.txt --script vulners
```

### VULNERS
```bash
cd /usr/share/nmap/scripts/ && git clone https://github.com/scipag/vulscan && cd utilities && cd updater && sudo chmod +x updateFiles.sh && sudo ./updateFiles.sh
alias vulscanupd='cd /usr/share/nmap/scripts/vulscan/utilities/updater && sudo ./updateFiles.sh' # for bashrc :)

nmap -sV -p- -T4 10.10.10.11 -vvv -oN result.txt --script vulscan/vulscan.nse
```

### EXAMPLES
```bash
nmap -sS -sV -p 445 --script vuln 10.10.10.11 -vv # vulnerability scanning on host
nmap -n -Pn -p 80 --open -sV -vvv --script banner,http-title -iR 1000
nmap -p445 --script smb-vuln-ms17-010 192.168.1.1
nmap -f -T0 -n -Pn -data-lenght 200 -D RND:10 192.168.1.1
nmap -T4 -sV --verion-all --osscan-gues -A -p 1-1000 192.169.1.1 -oN result.txt
```