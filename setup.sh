echo "This will setup engineer for use."
echo "After this is finished, you can delete this file."
echo "Wait 5 seconds to start.."
sleep 5

echo "Installing node dependencies..."
npm install

echo "Installing twemoji..."
git clone https://github.com/twitter/twemoji
mv twemoji/assets/72x72/ assets/twemoji
rm twemoji -rf

echo "" >> botLog.log
echo "[[\"person1\",0],[\"person2\",0],[\"person3\",100000000]]" >> data/money.json

echo "TOKEN=discordbottoken" >> ".env"
echo "TENOR=tenorkey" >> ".env"
echo "UV_THEADPOOL_SIZE=4" >> ".env"

echo "Done!"
echo "You can now delete this file (setup.sh), please read data/README.txt, and please change things in .env"