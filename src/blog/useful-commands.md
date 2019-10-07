---
title: Useful UNIX Commands
publishDate: 2019-10-07
---

## Restore date of an image from EXIF

`$ jhead -ft *.jpg`

## Send files over Rsync SSH

`rsync -av username@remote_host:/home/username/dir1 place_to_sync_on_local_machine`

`-v` for verbose
`-n` for dry run

## SSH tunnel

`ssh -L 9000:192.168.0.1:80 user@example.com`

This command allows you to connect to the router config page from outside the
network by using the address "http://localhost:9000".

This is really useful for editing the server network's router configuration from
a remote network.

`ssh -R 9000:192.168.0.1:80 user@example.com`

## Tar

Create an archive:

`tar cvf archive.tar /folder/to/tar`

Unpack an archive:

`tar xvf archive.tar`

## Connecting to the Internet

wpa_passphrase "<ssid>" "<password>" >> /etc/wpa_supplicant/wpa_supplicant.conf

## Rewriting Git Author Email and Name

```
git filter-branch --env-filter '
    OLD_EMAIL="your-old-email@example.com"
    CORRECT_NAME="Your Correct Name"
    CORRECT_EMAIL="your-correct-email@example.com"
    if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
    then
        export GIT_COMMITTER_NAME="$CORRECT_NAME"
        export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
    fi
    if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
    then
        export GIT_AUTHOR_NAME="$CORRECT_NAME"
        export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
    fi
    ' --tag-name-filter cat -- --branches --tags
```

## Backup Android Phone

- `adb backup -apk -shared -all`
- Creates a `backup.ab` file

- `adb restore backup.ab`
- To restore

## Clone All Files On Drive

`cp -ax / /new-disk`

## Write Image To Disk

`sudo dd if=file.img of=/dev/sdX bs=1M`

## Installing Unity Editor

`yaourt -S unity-editor --tmp ~/tmp`

## Compressing Video

`ffmpeg -i input.mp4 -b <bit rate (bytes/sec)> output.mp4`

## Reducing Video Resolution

- To 640x360 resolution

`ffmpeg -i input.mp4 -vf scale=640:360 output.mp4 -hide_banner`

## Retain File Timestamp

`touch newfile -r oldfile`

## Copying Files With SCP

`scp [options] jordan@host:directory1/filename1 destination`

## Joining 2 PDF Files Together

`pdfunite document-a.pdf document-b.pdf .. document-z.pdf document-out.pdf`

## Seeing changes between backup (example)

`vimdiff <( cd Documents && find . -not -path "**/.**" | sort && cd - ) <( sudo su -c "cd /root/snapshots/@2019-03-17/home/jordan/Documents && sudo find . -not -path \"**/.**\" | sort && cd -")`

## Mounting Directories Through SSH

`sshfs user@ip:/path/to/dir /mnt/local/path`
