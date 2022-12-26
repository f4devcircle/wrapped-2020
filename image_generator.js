const fs = require('fs')
const { loadImage, createCanvas } = require('canvas')

async function main () {

  const headerText = 'Naskapal Wrapped';
  const headerTextOptions = 'bold 25pt Gotham';
  const topVC = 'Video Call Teratas';
  const topSetlist = 'Setlist Teratas';
  const fontColor = '#000000';
  const headerFont = 'bold 30pt Sans-Serif';
  const fontStyle = '19pt Courier';
  const hashtag = '#jkt48wrapped2022';
  const winRate = 'Winrate Verif Teater';
  const totalVideoCall = 'Jumlah Video Call';
  const totalAttendance = 'Jumlah Kehadiran';
  const totalTopup = 'Total pengisian point';

  const singletText = '26pt Courier';

  const numberFormatter = new Intl.NumberFormat('en-US');

  const topVc = [{ name: 'Jesslyn Callista', amount: 60}, {name: 'Cynthia Yaputera', amount: 20}, {name: 'Jessica Chandra',  amount: 10}];
  const setlistAttendance = [{name: 'Tunas di Balik Seragam', amount: 12}, {name: 'Gadis Gadis Remaja', amount: 6}, {name: 'Aturan Anti Cinta', amount: 2}];
  const topupAmount = 100000;
  const vcAmount = 100;
  const attendanceAmount = 22;
  const winAmount = 0;
  const lostAmount = 100;
  const percentage = 25 //Math.round(winAmount / (winAmount + lostAmount) * 100);
  
  const width = 1080
  const height = 1600

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  const backgroundColor = '#e0e0e0'
  const fontBaseline = 'bottom'
  const fontAlignment = 'left'
  const rightTextPosition = width * 0.60
  const leftTextPosition = width * 0.10
  const topQuarter = height * 0.40
  const midHeight = height * 0.55
  const bottomQuarter = height * 0.65
  const midWidth = width * 0.50
  const leftQuarter = width * 0.25
  const rightQuarter = width * 0.75
  const winRateBreakdown = `(${winAmount} menang, ${lostAmount} kalah)`

  const winRateLength = context.measureText(winRate).width;
  
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  context.shadowBlur = 90
  context.shadowColor = 'rgba(0, 0, 0, 0.5)'
  context.fillStyle = backgroundColor
  context.fillRect(30, 30, width - 60, height - 60)

  context.shadowColor = 'transparent'


  context.lineWidth = 2
  context.moveTo(width * 0.25, 0, 0);
  context.lineTo(width * 0.25, height)

  context.lineWidth = 2
  context.moveTo(width * 0.50, 0, 0);
  context.lineTo(width * 0.50, height)

  context.lineWidth = 2
  context.moveTo(width * 0.60, 0, 0);
  context.lineTo(width * 0.60, height)

  context.lineWidth = 2
  context.moveTo(width * 0.70, 0, 0);
  context.lineTo(width * 0.70, height)

  context.lineWidth = 2
  context.moveTo(width * 0.80, 0, 0);
  context.lineTo(width * 0.80, height)

  context.lineWidth = 2
  context.moveTo(width * 0.75, 0, 0);
  context.lineTo(width * 0.75, height)

  context.lineWidth = 2
  context.moveTo(0, height * 0.25, 0);
  context.lineTo(width, height * 0.25);

  context.lineWidth = 2
  context.moveTo(0, height * 0.50, 0);
  context.lineTo(width, height * 0.50);

  context.lineWidth = 10
  context.strokeStyle = 'green'
  context.moveTo(0, height * 0.75, 0);
  context.lineTo(width, height * 0.75);
  // context.stroke()
  
  // headers 
  
  context.font = headerTextOptions
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  context.fillText(headerText, width / 2, 80)
  
  // top vc
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(topVC, leftTextPosition, topQuarter)

  
  // top setlist  
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(topSetlist, rightTextPosition + 25, topQuarter)
  
  
  for (let i = 0; i < topVc.length; i++) {
    context.font = fontStyle
    context.textBaseline = fontBaseline
    context.textAlign = fontAlignment
    context.fillStyle = fontColor
    context.fillText(`#${i + 1} ${topVc[i].name} - ${topVc[i].amount} Tiket`, leftTextPosition, topQuarter + 50 + (i * 50), 400)
  }

  for (let i = 0; i < setlistAttendance.length; i++) {
    context.font = fontStyle
    context.textBaseline = fontBaseline
    context.textAlign = fontAlignment
    context.fillStyle = fontColor
    context.fillText(`#${i + 1} ${setlistAttendance[i].name} - ${setlistAttendance[i].amount} kali`, rightTextPosition + 25, topQuarter + 50 + (i * 50), 300)
  }
  
  // Jumlah Video Call
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(totalVideoCall, leftTextPosition, midHeight)
  // video call number
  context.font = singletText
  context.textBaseline = fontBaseline
  context.textAlign = 'right'
  context.fillStyle = fontColor
  const totalVCLength = context.measureText(totalVideoCall).width;
  const totalVCValue = context.measureText(`${vcAmount} tiket`).width;
  context.fillText(`${vcAmount} tiket`, leftTextPosition + (totalVCLength - totalVCValue / 2), midHeight + 70)


  // Jumlah Kehadiran teater
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = fontAlignment
  context.fillStyle = fontColor
  context.fillText(totalAttendance, rightTextPosition, midHeight)
  // attendance number
  context.font = singletText
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  const totalAttendanceLength = context.measureText(totalAttendance).width;
  const totalAttendanceValue = context.measureText(`${attendanceAmount} kali`).width;
  context.fillText(`${attendanceAmount} kali`, rightTextPosition + (totalAttendanceLength / 2) + 10, midHeight + 70)

  // Total topup
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  context.fillText(totalTopup, midWidth, height * 0.30)
  // topup amount
  context.font = singletText
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  if (topupAmount === 0) {
    context.fillText('Nihil', midWidth, height * 0.25 + 70)
  }
  if (topupAmount > 0) {
    context.fillText(`${numberFormatter.format(topupAmount)} P`, midWidth, height * 0.30 + 70)
  }

  // Winrate
  context.font = headerFont
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  context.fillText(winRate, midWidth, height * 0.70)

  // percentage text
  context.font = singletText
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  context.fillText(`${percentage}%`, midWidth, height * 0.70 + 50)
  // percentage breakdown
  const winrateBreakdownFont = '20pt Gotham';
  context.font = winrateBreakdownFont
  context.textBaseline = fontBaseline
  context.textAlign = 'center'
  context.fillStyle = fontColor
  context.fillText(winRateBreakdown, midWidth, height * 0.70 + 100);

  // Footer
  context.fillRect(0, height - (height * 0.04), width, (height - (height * 0.05)))
  context.fillStyle = fontColor
  
  // Footer Text
  context.font = fontStyle
  context.textBaseline = fontBaseline
  context.textAlign = 'right'
  context.fillStyle = '#ffffff'
  context.fillText(hashtag, width - 20, height - (height * 0.03) + 30)
  
  
  // Footer Image
  const footerLogo = await loadImage('./assets/F4DCLogoTrans2.png')
  context.drawImage(footerLogo, 20, height - (height * 0.040), 64, 64)

  
  // oshi image
  const oshiImage = await loadImage('./assets/jesslyn_callista.jpeg')
  context.drawImage(oshiImage, ((width / 2) - 192 / 2), 120, 192, 270)
  const imgBuffer = canvas.toBuffer('image/png')
  fs.writeFileSync('./test.png', imgBuffer)
}

main();
