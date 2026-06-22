const extensionPattern = /\.(c|m)?[jt]sx?$/

/** @type {import('eslint').Rule.RuleModule} */
export const noImportExtensions = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow file extensions in relative import and export paths.',
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Do not use file extensions in import paths.',
		},
	},
	create(context) {
		function checkSource(source) {
			if (source.type !== 'Literal' || typeof source.value !== 'string') {
				return
			}

			const value = source.value

			if (!value.startsWith('.')) {
				return
			}

			const match = value.match(extensionPattern)

			if (!match) {
				return
			}

			context.report({
				node: source,
				messageId: 'unexpected',
				fix(fixer) {
					const fixed = value.slice(0, -match[0].length)
					const quote = source.raw?.[0] ?? "'"

					return fixer.replaceText(source, `${quote}${fixed}${quote}`)
				},
			})
		}

		return {
			ImportDeclaration(node) {
				checkSource(node.source)
			},
			ExportNamedDeclaration(node) {
				if (node.source) {
					checkSource(node.source)
				}
			},
			ExportAllDeclaration(node) {
				checkSource(node.source)
			},
		}
	},
}
