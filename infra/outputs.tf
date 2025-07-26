output "droplet_ip" {
  description = "Public IP of the droplet"
  value       = digitalocean_droplet.web.ipv4_address
}
