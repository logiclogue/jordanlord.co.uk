---
title: The Use and Abuse of Encryption
publishDate: 2017-11-02
draft
---

Encryption has significantly enhanced human communications in the fact that it
provides confidentiality. This surprisingly comes with many consequences.  To
send a message over the internet is incredibly cheap, providing you've got the
required equipment. The problem is that the internet isn't always controlled by
trusted parties. Your data could be passed through a malicious router, on its
way to its destination.  This is where encryption comes in. Encryption is a very
good method to hide your message from eavesdropping.

Symmetric encryption is just as secure as asymmetric encryption, depending on
how they're used of course. Symmetric encryption uses a single secret key that
both parties must know, whereas asymmetric encryption requires both parties to
have a pair of public and private keys. There are two problems with symmetric
encryption. The first is how to securely exchange keys. The second is the
logistics issue with managing a secret key for each person you talk to.
Asymmetric encryption solves the first by having a key pair. The public
key can be used to encrypt a message that is supposed to be for you. You decrypt
your messages with your private key. So the public key can be sent over a
network without any fear, bar a man-in-the-middle attack. Asymmetric encryption
also solves the logistics issue by you only having to know the recipients public
key, which could be easily collected from a public key database.

By adding a few steps to the encryption process, we can not only make encryption
provide confidentiality, but integrity as well. This requires the use of a
MAC (Message Authentication Code). A MAC provides integrity because you have
confidence that it was sent by the person you expected to receive the message
from. There is a particular type of MAC called a HMAC which uses a hashing
function to product the tag. Firstly, hash the key and the message. Second, add
the key and the hash, then hash it again. This final hash is the tag.

The uses for encryption go far beyond just hiding messages. Arguably the next
digital revolution: cryptocurrencies, and the most popular of them: Bitcoin, is
held up by encryption. Bitcoin is based on asymmetric encryption. So when you
want to send some Bitcoins to a friend, you to use that friend's public key.
Just like with normal asymmetric encryption, you must keep your private keys
secure. If you have a single Bitcoin, that will cost you £5000 by today's
evaluation. So please, keep your private keys safe!

Tor and VPNs take advantage of encryption to hide a user's traffic. VPN goes
through a single trusted party, whereas traffic on Tor goes through multiple
nodes. The idea of a VPN is to encrypt all of your traffic with the VPN server's
public key. Then when it gets to the VPN, your data is decrypted and sent to its
destination. This helps bypass firewalls and censorship. Tor works by encrypting
your message many times, like an onion (hence why it's sometimes called the
"Onion Router"), with the public keys of the nodes that you're going to route
your traffic through.  This has the advantage that not even the routers know who
the traffic is from, except the exit node. However, by using Tor or a VPN over
HTTP, for example, this is what's called a "secure tunnel" and not even the VPN
or the exit nodes know anything about the user's data.

We've spoken about the different uses of encryption. It may sound all well and
good until you realise that, just like anything, there must be a way to misuse
it.  There are different modes of encryption. ECB, also known as electronic codebook, is
arguably the simplest mode. It means using the same encryption key
for each block of the message. However, this produces the same ciphertext blocks
for identical message blocks. This is obviously terrible. Encryption should hide
*all* patterns in a message. CTR, also known as counter mode, uses the result of
index of the current encryption block and then adds this to the encrypted
message block. CTR is generally not considered a good mode of encryption. Better
is CBC, or cipher block chaining. CBC is where you get the previous block of
ciphertext and add it to the plaintext of the next block to be encrypted. This
is generally considered a much better mode of operation than the previous two.

Encryption is revolutionary for many things in the software world. That goes for
criminals too. Malicious parties can take advantage of encryption for their own
benefit. In fact, the study of this has its own name: cryptovirology.

Ransomware is one such malicious use of encryption. The idea of ransomware is to
encrypt the victim's files and ask for a ransom to then decrypt their data
again. Since the files are encrypted, the decryption key is required to retrieve
them, which only the creators of the ransomware have. In addition, the ransom
asked for by the hackers is normally in Bitcoin. Again, an indirect abuse of
encryption through bitcoin.

We spoke about the use of Tor and VPNs before to hide a user's internet traffic.
This has it's obvious advantages, but it also had its obvious disadvantages. It
allows criminals to securely communicate and hide their activity online. Based
on research done in 2015, 15.4% of hidden services used on Tor were for drugs.
This is massively alarming. And with the recent tragedies related to extremism.
The use of encryption has allowed terrorists and extremists to communicate, thus
leading the UK government to propose an encryption ban on apps that offer
end-to-end encryption.

If encryption isn't used correctly, a "man-in-the-middle" (a party who has
control of the message sending medium) can use the fact they have control to
their advantage. Exchanging keys over the network, that the man-in-the-middle
has control of, results in the man-in-the-middle being able to replace the
exchanged keys with his keys so he is able to read all of the messages.
Exchanging keys offline, or using a certification authority, can prevent this
type of attack.

In conclusion, like just about anything, encryption has it's uses and abuses.
However, with the internet, in combination with encryption, being relatively new
to civilisation, it has caused many problems. The essentiality of encryption in
modern society and the recent benefits encryption has given to terrorist has
left the crypto wars in a stalemate.
