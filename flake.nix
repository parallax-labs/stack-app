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
            nodePackages.pnpm
            nodePackages.vite
          ];
        };

        packages.default = pkgs.stdenv.mkDerivation {
          name = "stack-app";
          version = "0.1.0";
          src = ./.;

          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.pnpm
          ];

          buildPhase = ''
            export HOME=$(mktemp -d)
            pnpm install --frozen-lockfile
            pnpm build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/
          '';
        };
      });
} 