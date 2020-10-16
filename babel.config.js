module.exports = {
	plugins: [
		[
			'rewrite-require',
			{
				aliases: {
					_stream_duplex: 'readable-stream/duplex',
					_stream_passthrough: 'readable-stream/passthrough',
					_stream_readable: 'readable-stream/readable',
					_stream_transform: 'readable-stream/transform',
					_stream_writable: 'readable-stream/writable',
					crypto: 'react-native-crypto',
					stream: 'readable-stream',
					vm: 'vm-browserify'
				}
			}
		],
		[
			'module-resolver',
			{
				alias: {
					api: './src/api',
					components: './src/components',
					models: './src/models',
					screens: './src/screens',
					assets: './assets',
					utils: './src/utils',
					storage: './src/storage',
					tasks: './src/tasks'
				},
				root: ['.']
			}
		],
	],
	presets: ['module:metro-react-native-babel-preset']
};
