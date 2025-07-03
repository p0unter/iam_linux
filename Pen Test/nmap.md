nmap -p80,443,445 -sV -O --osscan-guess 192.168.1.10-50 -T4
nmap 192.168.1.15 : single ip scan
nmap 192.168.1.15 192.168.1.52 : more ip scan
nmap 192.168.1.1-254 : ip range defination
nmap 192.168.1.0/24 : with net mask
nmap abc.com : with domain
nmap -iL target.txt : with file
nmap -iR : host range
nmap --exculude 192.168.1.22 : exclude ip scanning
nmap 192.168.1.0/24 -n : without dns scanning
nmap 192.168.1.0/24 -sn : Scanning without port and name resolution.
nmap 192.168.1.0/24 -PR : Arp packet ping scan
nmap 192.168.1.0/24 -Pn : without ping and only port scanning
nmap 192.168.1.0/24 -PA : ping scanning with TCP & ACK flags

PORT
- - - - - - - - - - - -
nmap 192.168.1.10 -sT : TCP port scanning
nmap 192.168.1.10 -sS : TCP port scanning with SYN flag
nmap 192.168.1.10 -sU : UDP port scanning
nmap 192.168.1.10 -p 21-100 : specific port range scanning
nmap 192.168.1.10 -p U:53,T:21-25,80 : specific port range scanning (for TCP/UDP)
nmap 192.168.1.10 -p- : all ports scanning
nmap 192.168.1.10 -p http,fpt : scanning with service name
nmap 192.168.1.10 -F : quickly scanning 100 port
nmap 192.168.1.10 --top-ports 1000 : top ports scanning

VULNERABILITY SCANNING
- - - - - - - - - - - -
nmap 192.168.1.10 -sV : scan service running on port
nmap 192.168.1.10 -sV --verion-intensity 8 : 8th precision version scanning between 0-9
nmap 192.168.1.10 -sV --verion-light : light and fast version scanning
nmap 192.168.1.10 --version-all : highest level 9th version scanning

OS SCANNING
- - - - - - - - - - - -
nmap 192.168.1.1 -O : OS scanning (with TCP/IP fingerprint)
nmap 192.168.1.1 -O --osscan-limit : Scanning for targets with TCP ports
nmap 192.168.1.1 -O --osscan-guess : More aggressive scanning
nmap 192.168.1.1 -O --max-os-tries 1 : once scanning
nmap 192.168.1.1 -A : OS and Vulnerabilty scanning

SCRIPT
- - - - - - - - - - - -
nmap 192.168.1.1 -sC : scanning with most known scripts
nmap 192.168.1.1 --script http-sql-injection : scan with specific script
nmap 192.168.1.1 --script smb* : scanning with all of the specific scripts
nmap --script snmp-sysdescr --script-args snmpcommunity=admin 192.168.1.1 : throw arguments
nmap 192.168.1.1 --script vuln : with all script scanning

INTRUSION DETECTION SYSTEM (FIREWALL EVESION)
- - - - - - - - - - - -
nmap 192.168.1.1 -f : throw fragmented IP packets
nmap 192.168.1.1 --mtu 16 : scanning with change packet size
nmap -D RND:10 : scanning with random 10 decoy IP
nmap -D 192.168.1.5,192.168.1.6,192.168.1.7 192.168.1.1 : specific spoof ip scanning
nmap -S www.microsoft.com www.facebook.com : spoof source scanning
nmap -g 53 192.168.1.1 : scanning at specific source port number
nmap --proxies http://192.168.1.50:8080,http://192.168.1.20:80 192.168.1.1 : scanning with proxy
nmap --data-lenght 25 192.168.1.1 : randomly append 25 byte from the send packages

EXAMPLES
- - - - - - - - - - - -
nmap -sS -sV -p 445 --script vuln 10.10.10.11 -vv : vulnerability scanning on host
nmap -n -Pn -p 80 --open -sV -vvv --script banner,http-title -iR 1000
nmap -p445 --script smb-vuln-ms17-010 192.168.1.1
nmap -f -T0 -n -Pn -data-lenght 200 -D RND:10 192.168.1.1
nmap -T4 -sV --verion-all --osscan-gues -A -p 1-1000 192.169.1.1 -oN result.txt