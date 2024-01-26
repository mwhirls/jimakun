/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
    theme: {
        variants: {
            extend: {
                display: ["group-hover"],
            },
        },
    },
    plugins: [],
}

