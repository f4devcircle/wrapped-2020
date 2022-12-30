const fs = require('fs')
const { loadImage, createCanvas } = require('canvas')

/**
 * 
 * 
 * */
async function main (userData) {

  console.log(`will generate image with data ${JSON.stringify(userData)}`);

  const headerText = `${userData.username} JKT48 Wrapped`;
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

  const vcAmount = userData.vcAmount;
  const attendanceAmount = userData.attendanceAmount;
  const winAmount = userData.winAmount;
  const lostAmount = userData.lostAmount;
  const topVc = userData.vcRanks;
  const setlistAttendance = userData.setlistRanks;
  const percentage = Math.round(winAmount / (winAmount + lostAmount) * 100);
  const topupAmount = userData.totalTopup;

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
  const midWidth = width * 0.50
  const winRateBreakdown = `(${winAmount} menang, ${lostAmount} kalah)`


  if (setlistAttendance.length < 3) {
    const currentLength = setlistAttendance.length;
    for (let i = 0; i < - currentLength; i++) {
      setlistAttendance.push({ showName: '-', sum: 0 })
    }
  }

  if (vcRanks.length < 3) {
    const currentLength = vcRanks.length;
    for (let i = 0; i < - currentLength; i++) {
      vcRanks.push({ name: '-', sum: 0 })
    }
  }


  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  context.shadowBlur = 90
  context.shadowColor = 'rgba(0, 0, 0, 0.5)'
  context.fillStyle = backgroundColor
  context.fillRect(30, 30, width - 60, height - 60)

  context.shadowColor = 'transparent'
  
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
  
  for (let i = 0; i < 3; i++) {
    context.font = fontStyle
    context.textBaseline = fontBaseline
    context.textAlign = fontAlignment
    context.fillStyle = fontColor
    context.fillText(`#${i + 1} ${topVc[i].name ? topVc[i].name : '-' } - ${topVc[i].sum ? topVc[i].sum : 0} Tiket`, leftTextPosition, topQuarter + 50 + (i * 50), 400)
  }

  for (let i = 0; i < 3; i++) {
    context.font = fontStyle
    context.textBaseline = fontBaseline
    context.textAlign = fontAlignment
    context.fillStyle = fontColor
    context.fillText(`#${i + 1} ${setlistAttendance[i].showName ? setlistAttendance[i].showName : '-'} - ${setlistAttendance[i].sum ? setlistAttendance[i].sum : '0'} kali`, rightTextPosition + 25, topQuarter + 50 + (i * 50), 300)
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

  if (userData.generatePoints) {
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
  console.log(`will write file ${userData.filename}.png`);
  const oshiImage = await loadImage(`./assets/members_2022/${userData.oshi}`)
  context.drawImage(oshiImage, ((width / 2) - 192 / 2), 120, 192, 270)
  const imgBuffer = canvas.toBuffer('image/png')
  fs.writeFileSync(`./share/${userData.filename}.png`, imgBuffer)

  return;
}

module.exports = {
  main
}
