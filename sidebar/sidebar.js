console.log(window);
const db = new Surreal();

async function initDB() {
  try {
    console.log("Initializing SurrealDB connection...");
    await db.connect("indxdb://demo");
    console.log("SurrealDB connected successfully!");
  } catch (error) {
    console.error("Failed to connect to SurrealDB:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM content loaded");

  await initDB();

  const createButton = document.getElementById("create-stack");
  if (createButton) {
    console.log("Create Stack button found");
    createButton.addEventListener("click", createStack);
  } else {
    console.error("Create Stack button not found");
  }

  document.getElementById("import-file").addEventListener("change", importStacks);
});

async function createStack() {
  console.log("Create Stack button clicked");

  const name = prompt("Enter stack name:");
  if (!name) {
    console.log("No stack name provided.");
    return;
  }

  try {
    console.log(`Creating stack with name: ${name}`);
    await db.create("stack", { name, components: [] });
    console.log("Stack created successfully.");
    displayStacks();
  } catch (error) {
    console.error("Error creating stack:", error);
  }
}


async function importStacks(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const stacks = JSON.parse(e.target.result);
    for (const stack of stacks) {
      await db.create("stack", stack);
    }
    displayStacks();
  };
  reader.readAsText(file);
}

async function displayStacks() {
  const stacks = await db.select("stack");
  const container = document.getElementById("stack-container");
  container.innerHTML = "";

  stacks.forEach((stack) => {
    const div = document.createElement("div");
    div.textContent = stack.name;
    container.appendChild(div);
  });
}
