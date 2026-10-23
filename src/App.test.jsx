import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
    it("renders the greeting", () => {
        render(<App />);

        expect(screen.getByRole("heading", { name: "Hello, World!" })).toBeInTheDocument();
    });
});
