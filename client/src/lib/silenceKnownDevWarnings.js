if (import.meta.env.DEV) {
  const originalError = console.error;

  console.error = (...args) => {
    const message = args.join(" ");
    const isReactBeautifulDndDefaultPropsWarning =
      message.includes("Support for defaultProps will be removed from memo components") &&
      message.includes("Connect(Droppable)");

    if (isReactBeautifulDndDefaultPropsWarning) return;
    originalError(...args);
  };
}
