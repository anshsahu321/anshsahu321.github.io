#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupPortfolio() {
  console.log('🚀 Welcome to Terminal Portfolio Setup!');
  console.log('This script will help you customize your portfolio with your personal information.\n');

  try {
    // Get user information
    const name = await question('Enter your full name: ');
    const title = await question('Enter your professional title: ');
    const email = await question('Enter your email: ');
    const location = await question('Enter your location (City, Country): ');
    const bio = await question('Enter a brief bio: ');
    const github = await question('Enter your GitHub username: ');
    const linkedin = await question('Enter your LinkedIn username: ');
    const twitter = await question('Enter your Twitter username (optional): ');

    // Read the data file
    const dataPath = path.join(__dirname, 'lib', 'data.ts');
    let dataContent = fs.readFileSync(dataPath, 'utf8');

    // Replace placeholders
    dataContent = dataContent.replace(/Your Name/g, name);
    dataContent = dataContent.replace(/Software & AI Engineer/g, title);
    dataContent = dataContent.replace(/your\.email@example\.com/g, email);
    dataContent = dataContent.replace(/Your City, Country/g, location);
    dataContent = dataContent.replace(/Passionate software engineer with expertise in full-stack development, AI\/ML, and cloud technologies\. Building innovative solutions that make a difference\./g, bio);
    dataContent = dataContent.replace(/yourusername/g, github);
    dataContent = dataContent.replace(/https:\/\/github\.com\/yourusername/g, `https://github.com/${github}`);
    dataContent = dataContent.replace(/https:\/\/linkedin\.com\/in\/yourusername/g, `https://linkedin.com/in/${linkedin}`);
    
    if (twitter) {
      dataContent = dataContent.replace(/https:\/\/twitter\.com\/yourusername/g, `https://twitter.com/${twitter}`);
    }

    // Write the updated data file
    fs.writeFileSync(dataPath, dataContent);

    // Update package.json name
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageContent.name = `portfolio-${github.toLowerCase()}`;
    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));

    console.log('\n✅ Setup complete! Your portfolio has been customized with your information.');
    console.log('\n📝 Next steps:');
    console.log('1. Review and update your projects in lib/data.ts');
    console.log('2. Add your skills and experience');
    console.log('3. Replace the avatar placeholder with your photo');
    console.log('4. Run "npm run dev" to start the development server');
    console.log('5. Deploy to Vercel or Netlify when ready');
    
    console.log('\n🎉 Happy coding!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupPortfolio();
