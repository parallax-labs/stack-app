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
          
          shellHook = ''
            export NODE_EXTRA_CA_CERTS="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
          '';
        };

        packages.default = pkgs.stdenv.mkDerivation {
          name = "stack-app";
          version = "0.1.0";
          src = ./.;

          yarnDeps = pkgs.fetchYarnDeps {
            yarnLock = ./yarn.lock;
            sha256 = "sha256-n+vmzJk260pfulyAhyjNkhAJXULeqvEV+HF8Sbr8xl8=";
          };

          nativeBuildInputs = with pkgs; [
            nodejs_20
            yarn
            zip
          ];

          configurePhase = ''
            export HOME=$(mktemp -d)
            # Copy dependencies to writable directory
            cp -r $yarnDeps $HOME/deps
            chmod -R u+w $HOME/deps
          '';

          buildPhase = ''
            export NODE_EXTRA_CA_CERTS="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            
            # Point Yarn to the writable dependency directory
            yarn config set yarn-offline-mirror "$HOME/deps"
            
            # Install using offline dependencies
            yarn install --frozen-lockfile --ignore-engines --ignore-scripts
            
            # Build project
            yarn build
          '';

          installPhase = ''
            mkdir -p $out/unpacked
            cp -r dist/* $out/unpacked/
            cp manifest.json $out/unpacked/
            
            mkdir -p $out/unpacked/icons
            cp -r icons/* $out/unpacked/icons/
            
            cd $out/unpacked
            zip -r $out/stack-app.zip ./*
          '';
        };
      });
}