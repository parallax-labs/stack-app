{
  description = "Stack App Chrome Extension";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        node-modules = pkgs.mkYarnPackage {
          name = "node-modules";
          src = ./.;
        };
        stackapp = pkgs.stdenv.mkDerivation {
          name = "stack-app";
          src = ./.;
          buildInputs = [pkgs.yarn node-modules];
          buildPhase = ''
            ln -s ${node-modules}/libexec/stack-app/node_modules node_modules
            ${pkgs.yarn}/bin/yarn build
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

            meta = with pkgs.lib; {
              description = "Stack App Browser Extension";
              homepage = "https://stackapp.cloud";
              license = licenses.mit;
              platforms = platforms.all;
            };

        };
      in 
        {
          packages = {
            node-modules = node-modules;
            default = stackapp;
          };
        }
    );
}
