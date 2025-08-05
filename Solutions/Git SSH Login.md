> Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# or
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

> Copy Generated Key
```bash
cat ~/.ssh/id_ed25519.pub
```

> SSH instead of HTTPS
```bash
git remote set-url origin git@github.com:p0unter/iam_linux.git
```

> Check Github Connection
```bash
ssh -T git@github.com
```