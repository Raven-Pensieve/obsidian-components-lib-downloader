module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	moduleNameMapper: {
		"^@src/(.*)$": "<rootDir>/src/$1",
		"^@styles/(.*)$": "<rootDir>/styles/$1",
	},
	moduleFileExtensions: ["ts", "tsx", "js", "json"],
	collectCoverageFrom: [
		"src/**/*.ts",
		"!src/**/*.d.ts",
		"!**/*.test.ts",
		"!**/*.spec.ts",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
};
