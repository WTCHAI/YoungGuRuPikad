module.exports = {
    plugins: ["prettier-plugin-solidity"],
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    singleQuote: false,
    bracketSpacing: true,
    overrides: [
        {
            files: "*.sol",
            options: {
                tabWidth: 4,
            },
        },
    ],
};
