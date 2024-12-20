let process = {
  env: {
    OPENAI_API_KEY: 'lootme'
  }
}

export default (context: any) => {
  context.process = process;

  return context
}

