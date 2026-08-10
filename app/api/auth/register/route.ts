// import { type NextRequest, NextResponse } from "next/server"
// import { registerUser } from "@/lib/auth"
// export const dynamic = "force-dynamic"
 
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
//     const { full_name, email, phone, age, sex, password, confirmPassword, profile_picture } = body
 
//     // Validation
//     if (!full_name || !email || !password) {
//       return NextResponse.json(
//         { success: false, message: "Full name, email, and password are required" },
//         { status: 400 },
//       )
//     }
 
//     if (password !== confirmPassword) {
//       return NextResponse.json({ success: false, message: "Passwords do not match" }, { status: 400 })
//     }
 
//     if (password.length < 8) {
//       return NextResponse.json(
//         { success: false, message: "Password must be at least 8 characters long" },
//         { status: 400 },
//       )
//     }

//     const hasLetter = /[a-zA-Z]/.test(password)
//     const hasNumber = /[0-9]/.test(password)
//     const hasSpecial = /[^a-zA-Z0-9]/.test(password)

//     if (!hasLetter || !hasNumber || !hasSpecial) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Password must contain at least one letter, one number, and one special character (!@#$%^&*)",
//         },
//         { status: 400 },
//       )
//     }
 
//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(email)) {
//       return NextResponse.json({ success: false, message: "Please enter a valid email address" }, { status: 400 })
//     }
 
//     const result = await registerUser({
//       full_name,
//       email: email.toLowerCase(),
//       phone,
//       age: age ? Number.parseInt(age) : undefined,
//       sex,
//       password,
//       profile_picture,
//     })
 
//     if (result.success) {
//       return NextResponse.json(result)
//     } else {
//       return NextResponse.json(result, { status: 400 })
//     }
//   } catch (error) {
//     console.error("Registration API error:", error)
//     return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
//   }
// }


import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Common disposable / temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "throwaway.email", "guerrillamail.com",
  "sharklasers.com", "guerrillamailblock.com", "grr.la", "guerrillamail.info",
  "spam4.me", "trashmail.com", "trashmail.me", "trashmail.net", "trashmail.at",
  "trashmail.io", "yopmail.com", "yopmail.fr", "cool.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "dispostable.com",
  "maildrop.cc", "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
  "tempr.email", "discard.email", "spamboy.com", "tempinbox.com", "fakeinbox.com",
  "mailnull.com", "spamhereplease.com", "mailnew.com", "spamfree24.org",
  "mailscrap.com", "spammotel.com", "inoutmail.de", "inoutmail.eu",
  "inoutmail.info", "inoutmail.net", "filzmail.com", "throwam.com",
  "throwem.com", "spamex.com", "mytrashmail.com", "mt2009.com",
  "trashdevil.com", "trashdevil.de", "mt2014.com", "spamfree.eu",
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "objectmail.com",
  "obobbo.com", "oneoffemail.com", "onewaymail.com", "online.ms",
  "onqin.com", "opentrash.com", "oopi.org", "ordinaryamerican.net",
  "otherinbox.com", "ourklips.com", "outlawspam.com", "ovpn.to",
  "owlpic.com", "rtrtr.com", "s0ny.net", "safe-mail.net",
  "sandelf.de", "saynotospams.com", "selfdestructingmail.com",
  "sendspamhere.com", "senseless-entertainment.com", "services391.com",
  "sharklasers.com", "shieldedmail.com", "shiftmail.com", "shitmail.me",
  "skeefmail.com", "slapsfromlindas.com", "slaskpost.se", "slave-auctions.net",
  "slippery.email", "slopsbox.com", "slothmail.net", "slushmail.com",
  "sneakemail.com", "sneakmail.de", "snkmail.com", "sofimail.com",
  "sofort-mail.de", "sogetthis.com", "sohu.com", "soodonims.com",
  "spam.la", "spam.su", "spamavert.com", "spambob.com", "spambob.net",
  "spambob.org", "spambog.com", "spambog.de", "spambog.ru",
  "spambox.info", "spambox.irishspringrealty.com", "spambox.us",
  "spamcannon.com", "spamcannon.net", "spamcero.com", "spamcon.org",
  "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net", "spamcowboy.org",
  "spamday.com", "spamex.com", "spamfree24.de", "spamfree24.eu",
  "spamfree24.info", "spamfree24.net", "spamgoes.in", "spamgourmet.com",
  "tempemail.net", "tempinbox.co.uk", "temporaryemail.net", "temporaryforwarding.com",
  "temporaryinbox.com", "temporarymail.org", "tempthe.net", "thankyou2010.com",
  "thecloudindex.com", "thisisnotmyrealemail.com", "thismail.net", "throwam.com",
  "tinyurl24.com", "tmail.com", "tmailinator.com", "tokem.co",
  "tradermail.info", "trash-mail.at", "trash-mail.com", "trash-mail.de",
  "trash-mail.ga", "trash-mail.io", "trash-mail.me", "trash-mail.ml",
  "trashmail.at", "trashmail.com", "trashmail.io", "trashmail.me",
  "trashmail.net", "trashmail.org", "trashmail.xyz", "trashmailer.com",
  "trashtiara.com", "trbvm.com", "trickmail.net", "trillianpro.com",
  "tryalert.com", "turual.com", "twinmail.de", "tyldd.com",
  "uggsrock.com", "umail.net", "upliftnow.com", "uplipht.com",
  "uroid.com", "us.af", "venompen.com", "veryrealemail.com",
  "viditag.com", "viewcastmedia.com", "viewcastmedia.net", "viewcastmedia.org",
  "vinernet.com", "vipmail.pw", "vpn.st", "vsimcard.com",
  "vubby.com", "walala.org", "walkmail.net", "walkmail.ru",
  "wbml.net", "webemail.me", "webm4il.info", "wegwerf-email.at",
  "wegwerf-email.de", "wegwerf-email.net", "wegwerf-email.org",
  "wegwerfadresse.de", "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org",
  "wetrainbayarea.com", "wetrainbayarea.org", "wilemail.com", "willhackforfood.biz",
  "willselfdestruct.com", "winemaven.info", "wronghead.com", "www.e4ward.com",
  "wwnew.com", "wwwnew.eu", "x1x.spb.ru", "xagloo.co",
  "xagloo.com", "xemaps.com", "xents.com", "xmaily.com",
  "xoxy.net", "xsmail.com", "xww.ro", "xxlocanto.us",
  "xxolocanto.us", "xyzfree.net", "yapped.net", "yeah.net",
  "yep.it", "yogamaven.com", "yopmail.com", "yopmail.fr",
  "yopmail.gq", "youmailr.com", "yourdomain.com", "ypmail.webarnak.fr.eu.org",
  "yuurok.com", "z1p.biz", "za.com", "zehnminutenmail.de",
  "zetmail.com", "zhorachu.com", "zippymail.info", "zoaxe.com",
  "zoemail.com", "zoemail.net", "zoemail.org", "zomg.info",
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, phone, age, sex, password, confirmPassword, profile_picture } = body

    // Required fields
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Full name, email, and password are required" },
        { status: 400 },
      )
    }

    // Password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      )
    }

    // Password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    // Password complexity
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^a-zA-Z0-9]/.test(password)
    if (!hasLetter || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least one letter, one number, and one special character (!@#$%^&*)",
        },
        { status: 400 },
      )
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Disposable email domain check
    const emailDomain = email.split("@")[1]?.toLowerCase()
    if (emailDomain && DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        {
          success: false,
          message: "Temporary or disposable email addresses are not allowed. Please use your real email address.",
        },
        { status: 400 },
      )
    }

    // registerUser handles: MX record check + DB insert + welcome email
    const result = await registerUser({
      full_name,
      email: email.toLowerCase(),
      phone,
      age: age ? Number.parseInt(age) : undefined,
      sex,
      password,
      profile_picture,
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}