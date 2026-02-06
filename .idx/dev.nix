{ pkgs, ... }:
{
  # https://nix.dev/reference/nix-language/a-tour-of-nix#files
  # environment.systemPackages = [ pkgs.some-package ];

  # https://nix.dev/guides/configuration/hm-options.html
  # home.packages = [ pkgs.some-package ];

  # https://nix.dev/reference/nix-language/functions#built-in-functions
  # environment.variables.VAR_NAME = "value";

  # https://nix.dev/reference/nix-language/modules
  # services.some-service.enable = true;
  environment.systemPackages = [ pkgs.python3 pkgs.python3.pkgs.pip ];
}