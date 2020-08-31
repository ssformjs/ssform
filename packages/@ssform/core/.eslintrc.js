module.exports = {
    root: true,
    env: {
        "jest/globals": true
    },
    extends: [
        'plugin:jest/recommended',
        "eslint-config-2o3t/typescript"
    ],
    plugins: [
        'jest',
    ],
}
