resource "digitalocean_droplet" "web" {
  name               = "examplecorp-web"
  region             = "nyc3"
  size               = "s-1vcpu-1gb"
  image              = "ubuntu-22-04-x64"
  ssh_keys           = [var.ssh_key_fingerprint]
  backups            = false
  ipv6               = true
  monitoring         = true

  tags = ["examplecorp"]
}
