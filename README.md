# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Resources:

- [video about musescore font](https://www.youtube.com/watch?v=XGo4PJd1lng)
- [Leland music fonts](https://github.com/MuseScoreFonts/Leland)
- [standard music font layout](https://w3c.github.io/smufl/latest/index.html)
- [musicXML wiki](https://www.w3.org/2021/06/musicxml40/)
- [Tool for viewing all font symbols](https://fontdrop.info/)
- [May need this for font conversion](https://www.fontsquirrel.com/tools/webfont-generator)
- [Subset web fonts](https://web.dev/learn/performance/optimize-web-fonts#:~:text=Note%3A%20The%20only%20time%20you,font%20formats%20other%20than%20WOFF2.)
