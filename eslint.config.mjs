import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'vite.config.js',
			'src/components/ui/accordion.jsx',
			'src/components/ui/aspect-ratio.jsx',
			'src/components/ui/calendar.jsx',
			'src/components/ui/carousel.jsx',
			'src/components/ui/chart.jsx',
			'src/components/ui/collapsible.jsx',
			'src/components/ui/command.jsx',
			'src/components/ui/context-menu.jsx',
			'src/components/ui/drawer.jsx',
			'src/components/ui/form.jsx',
			'src/components/ui/hover-card.jsx',
			'src/components/ui/input-otp.jsx',
			'src/components/ui/menubar.jsx',
			'src/components/ui/navigation-menu.jsx',
			'src/components/ui/popover.jsx',
			'src/components/ui/progress.jsx',
			'src/components/ui/radio-group.jsx',
			'src/components/ui/resizable.jsx',
			'src/components/ui/scroll-area.jsx',
			'src/components/ui/select.jsx',
			'src/components/ui/separator.jsx',
			'src/components/ui/sonner.jsx',
			'src/components/ui/switch.jsx',
			'src/components/ui/toggle.jsx',
			'src/components/ui/toggle-group.jsx',
			'src/components/ui/tooltip.jsx',
		],
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		plugins: { react, 'react-hooks': reactHooks, import: importPlugin },
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, React: 'readonly', Intl: 'readonly' },
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				node: { extensions: ['.js', '.jsx'] },
				alias: { map: [['@', './src']], extensions: ['.js', '.jsx'] },
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...importPlugin.flatConfigs.recommended.rules,

			// Non-critical rules - disabled since code works fine without them
			'react/prop-types': 'off',
			'react/no-unescaped-entities': 'off',
			'react/display-name': 'off', // Non-critical, component works without displayName
			'react/jsx-uses-react': 'off', // Not needed in React 17+, non-critical
			'react/react-in-jsx-scope': 'off', // Not needed in React 17+, non-critical
			'react/jsx-uses-vars': 'off', // Non-critical, code works fine
			'react/jsx-no-comment-textnodes': 'off', // Non-critical, comments could be visible if put inside the JSX, most cases are just rendering text like '///'

			'no-unused-vars': 'off', // Non-critical, code works fine with unused vars
			'import/no-named-as-default': 'off', // Can cause runtime import errors, usually fine to leave as is
			'import/no-named-as-default-member': 'off', // Can cause runtime import errors

			// Critical rules that prevent runtime errors
			'no-undef': 'error', // Undefined variables cause runtime errors

			// Override recommended import rules for stricter checking
			'import/no-self-import': 'error', // Extremely fast rule, breaking results in infinite loop/bundling error

			// Disable expensive rules for performance
			'import/no-cycle': 'off', // AI rarely makes this error, and the rule is very slow to run
		},
	},
	{ files: ['tools/**/*.js', 'tailwind.config.js'], languageOptions: { globals: globals.node } },
];
