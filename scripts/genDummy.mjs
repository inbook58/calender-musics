import fs from 'fs'
const arr = Array.from({ length: 365 }, (_, i) => {
  const n = String(i + 1).padStart(3, '0')
  return {
    id: i + 1,
    title: `曲タイトル ${n}`,
    description: `${n}日目の紹介文`,
    image: `/images/${n}.jpg`,
    link: `https://example.com/${n}`,
  }
})
fs.mkdirSync('src/data', { recursive: true })
fs.writeFileSync('src/data/songs.json', JSON.stringify(arr, null, 2))
console.log('generated: src/data/songs.json')
