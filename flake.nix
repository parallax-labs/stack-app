{
  description = "Stack App - Vue.js Browser Extension";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.yarn
            nodePackages.vite
          ];
          
          # Add SSL certificates and DNS configuration for the dev shell
          shellHook = ''
            export NODE_EXTRA_CA_CERTS="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export SYSTEM_CERTIFICATE_PATH="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
          '';
        };

        packages.default = pkgs.stdenv.mkDerivation {
          name = "stack-app";
          version = "0.1.0";
          src = ./.;

          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.yarn
            zip
          ];

          buildPhase = ''
            export HOME=$(mktemp -d)
            # Add SSL certificates
            export NODE_EXTRA_CA_CERTS="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export SYSTEM_CERTIFICATE_PATH="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            
            # Ensure network configuration
            yarn config set network-timeout 600000
            yarn config set registry "https://registry.yarnpkg.com"
            
            yarn install
            yarn build 
          '';

          installPhase = ''
            mkdir -p $out/unpacked
            cp -r dist/* $out/unpacked/
            cp manifest.json $out/unpacked/
            
            # Copy icons
            mkdir -p $out/unpacked/icons
            cp -r icons/* $out/unpacked/icons/
            
            # Create the zip file
            cd $out/unpacked
            zip -r $out/stack-app.zip ./*
          '';
        };
      });
} 