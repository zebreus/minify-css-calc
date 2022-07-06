{ pkgs ? import <nixpkgs> {} }:
with pkgs;
mkShell {
  nativeBuildInputs = [ 
    nodejs-18_x
    yarn
    terraform
    git
    jq
  ] ++ (if stdenv.isDarwin then [  ] else [ docker docker-compose]);
  shellHook = with pkgs; ''
    export PATH="$(pwd)/node_modules/.bin:$PATH"
  '';
}
