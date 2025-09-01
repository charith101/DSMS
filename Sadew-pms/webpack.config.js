const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Optimization configuration
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // React and related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 20,
        },
        // Chart libraries
        charts: {
          test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
          name: 'charts-vendor',
          chunks: 'all',
          priority: 15,
        },
        // Common components
        common: {
          minChunks: 2,
          chunks: 'all',
          name: 'common',
          priority: 5,
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  },

  // Performance budget
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },

  // Plugins for production optimization
  plugins: [
    // Analyze bundle size (only when ANALYZE=true)
    ...(process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : []),
    
    // Gzip compression for production
    ...(process.env.NODE_ENV === 'production' ? [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    ] : []),
  ],

  // Module resolution optimizations
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  // Module rules for optimization
  module: {
    rules: [
      // CSS optimization
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: process.env.NODE_ENV === 'production' 
                  ? '[hash:base64:5]' 
                  : '[name]__[local]__[hash:base64:5]',
              },
            },
          },
          'postcss-loader',
        ],
      },
      // Image optimization
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
      // Font optimization
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // Development server configuration
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    port: 3001,
  },

  // Source map configuration
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
};