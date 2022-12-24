const fs = require('fs')

async function main () {

  const headerText = 'Naskapal Wrapped 2022'
  const topVC = 'Video Call Teratas 2022'
  const topSetlist = 'Setlist Teratas 2022'
  const fontColor = '#000000'
  const fontStyle = 'bold 15pt Gotham'
  const hashtag = '#jkt48wrapped2022'
  
  const { loadImage, createCanvas } = require('canvas')
  const width = 1080
  const height = 1600
  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  const backgroundColor = '#e0e0e0'
  const fontBaseline = 'top'
  const fontAlignment = 'center'
  
  
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, width, height)
  
  // headers 
  
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(headerText, width / 2, 80)
  
  // top vc
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(topVC, width * 0.22, height * 0.25)

  
  // top setlist  
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(topSetlist, width * 0.75, height * 0.25)
  
  
  // Top VC #1
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#1 Jesslyn Callista - 60 Tiket', width * 0.16, (height * 0.25) + 50)
  // Top VC #2
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#2 Jesslyn Elly - 20 Tiket', width * 0.16, (height * 0.25) + 100)
  // Top VC #3
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#3 Maria Natalia Genoveva Desy Purnamasari Gunawan - 10 Tiket', width * 0.16, (height * 0.25) + 150, (width * 0.16) + 150)

  // Top Setlist #1
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#1 Tunas di Balik Seragam - 12 kali', width * 0.66, (height * 0.25) + 50, 300)
  // Top Setlist #2
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#2 Gadis Gadis Remaja - 6 kali', width * 0.66, (height * 0.25) + 100, 300)
  // Top Setlist #3
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'left'
  context.fillStyle = fontColor
  context.fillText('#2 Aturan Anti Cinta - 2 kali', width * 0.66, (height * 0.25) + 150, 300)
  
  // Jumlah Video Call
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('Keseluruhan Video Call 2022', width * 0.25, height * 0.50)
  // video call number

  // Jumlah Kehadiran teater
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('Jumlah Kehadiran Teater 2022', width * 0.75, height * 0.50)
  // attendance number

  // Total topup
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('Total pengisian point di 2022', width * 0.25, height * 0.75)
  // topup amount
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('9,000,000', width * 0.25, (height * 0.75) + 35 )
  // Winrate
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('Persentase Kemenangan Undian Teater 2022', width * 0.75, height * 0.75)
  // percentage text
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('60%', width * 0.75, (height * 0.75) + 35)
  // percentage breakdown
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText('(6 kali menang, 4 kali kalah)', width * 0.75, (height * 0.75) + 70)

  // Footer
  context.fillRect(0, height - (height * 0.04), width, (height - (height * 0.05)))
  context.fillStyle = fontColor
  
  // Footer Text
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'right'
  context.fillStyle = '#ffffff'
  context.fillText(hashtag, width - 20, height - (height * 0.03) + 20)
  
  
  // Footer Image
  const footerLogo = await loadImage('./assets/F4DCLogoTrans2.png')
  context.drawImage(footerLogo, 20, height - (height * 0.045), 128, 128)

  
  // oshi image
  const oshiImage = await loadImage('./assets/jesslyn_callista.jpeg')
  console.log(context.measureText(headerText).width)
  context.drawImage(oshiImage, ((width / 2) - 60), 120, 128, 180)
  const imgBuffer = canvas.toBuffer('image/png')
  fs.writeFileSync('./test.png', imgBuffer)
}

main();
