const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');


console.log('🚀 Starting build optimization and analysis...\n');


process.env.ANALYZE = 'true';
process.env.NODE_ENV = 'production';

try {

  console.log('📦 Building production bundle...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Analyze bundle size
  console.log('\n📊 Analyzing bundle size...');
  
  const buildPath = path.join(__dirname, '../build/static');
  
  if (fs.existsSync(buildPath)) {
    const jsFiles = fs.readdirSync(path.join(buildPath, 'js'))
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(buildPath, 'js', file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);
    
    const cssFiles = fs.readdirSync(path.join(buildPath, 'css'))
      .filter(file => file.endsWith('.css'))
      .map(file => {
        const filePath = path.join(buildPath, 'css', file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);
    
    console.log('\n📋 Bundle Analysis Report:');
    console.log('================================');
    
    console.log('\n📄 JavaScript Files:');
    jsFiles.forEach(file => {
      const status = file.size > 250000 ? '⚠️ ' : '✅ ';
      console.log(`${status}${file.name}: ${file.sizeKB} KB`);
    });
    
    console.log('\n🎨 CSS Files:');
    cssFiles.forEach(file => {
      const status = file.size > 50000 ? '⚠️ ' : '✅ ';
      console.log(`${status}${file.name}: ${file.sizeKB} KB`);
    });
    
    const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCSS = cssFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSize = totalJS + totalCSS;
    
    console.log('\n📊 Summary:');
    console.log(`Total JavaScript: ${(totalJS / 1024).toFixed(2)} KB`);
    console.log(`Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`);
    console.log(`Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    // Performance recommendations
    console.log('\n💡 Recommendations:');
    if (totalJS > 500000) {
      console.log('⚠️  Consider further code splitting to reduce JavaScript bundle size');
    }
    if (totalCSS > 100000) {
      console.log('⚠️  Consider CSS optimization and unused CSS removal');
    }
    if (totalSize < 300000) {
      console.log('✅ Bundle size is optimized!');
    }
    
 
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      jsFiles: jsFiles,
      cssFiles: cssFiles,
      recommendations: []
    };
    
    if (totalJS > 500000) {
      report.recommendations.push('Reduce JavaScript bundle size through code splitting');
    }
    if (totalCSS > 100000) {
      report.recommendations.push('Optimize CSS and remove unused styles');
    }
    
    fs.writeFileSync(
      path.join(__dirname, '../build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Build report saved to build-report.json');
    
  } else {
    console.error('❌ Build directory not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n✅ Build optimization analysis complete!');