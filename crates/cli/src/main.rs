use clap::Parser;
use plugin_core::{save_stack, Stack};
use tokio;

#[derive(Parser)]
#[command(name = "stack-cli")]
#[command(about = "CLI tool to manage deployment stacks")]
struct Cli {
    #[arg(short, long)]
    name: String,

    #[arg(short, long, num_args = 1.., value_delimiter = ',')]
    components: Vec<String>,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    let stack = Stack {
        name: cli.name,
        components: cli.components,
    };

    match save_stack(stack).await {
        Ok(_) => println!("Stack saved successfully."),
        Err(e) => eprintln!("Error saving stack: {}", e),
    }
}
