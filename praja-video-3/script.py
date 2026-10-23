"""The VO script from "Praja Video 3: Simple Narration Script (Praja style)".

Each slide is a list of caption segments: (roman, devanagari).
  roman       -> the on-screen caption, word for word from the PDF
  devanagari  -> what ElevenLabs reads (same words, Hindi script, so the Hindi
                 voice says them like a Hindi speaker instead of reading English)
LISTEN / INFORM / RESPOND / FACILITATE stay in English, as the PDF asks.

Order follows the PDF's own note: slide 21 (property tax) is placed right after
slide 19 (single window), not between 20 and 22.
Slides 7+8 and 22+23 are one sentence each: they are voiced in one take ("join").
"""

SLIDES = [
    (1, [("Ek jagruk nagrik ka safar.", "एक जागरूक नागरिक का सफ़र।")]),
    (2, [
        ("Shehar ke kaam mein nagrik ki asli bhagidaari kaisi hoti hai?",
         "शहर के काम में नागरिक की असली भागीदारी कैसी होती है?"),
        ("Kya iska matlab sirf chunaav mein vote dena, tax bharna,",
         "क्या इसका मतलब सिर्फ़ चुनाव में वोट देना, टैक्स भरना,"),
        ("complaint karna, ya kabhi-kabhi kisi public consultation mein jaana hai?",
         "कंप्लेंट करना, या कभी-कभी किसी पब्लिक कंसल्टेशन में जाना है?"),
    ]),
    (3, [
        ("Asli bhagidaari isse kahin zyada hai.", "असली भागीदारी इससे कहीं ज़्यादा है।"),
        ("Ye ek lagaataar safar hai, jismein nagrik apni zarooratein batate hain,",
         "ये एक लगातार सफ़र है, जिसमें नागरिक अपनी ज़रूरतें बताते हैं,"),
        ("faislon mein hissa lete hain, kaam ki pragati par nazar rakhte hain,",
         "फ़ैसलों में हिस्सा लेते हैं, काम की प्रगति पर नज़र रखते हैं,"),
        ("aur apni city sarkar ko jawabdeh banate hain.",
         "और अपनी सिटी सरकार को जवाबदेह बनाते हैं।"),
    ]),
    (4, [
        ("Shehar ke digital platform tax bharna, licence ke liye apply karna",
         "शहर के डिजिटल प्लेटफ़ॉर्म टैक्स भरना, लाइसेंस के लिए अप्लाई करना"),
        ("aur complaint darj karna aasaan bana dete hain.",
         "और कंप्लेंट दर्ज करना आसान बना देते हैं।"),
        ("Lekin bhagidaari ka ek zaroori hissa aksar chhoot jaata hai.",
         "लेकिन भागीदारी का एक ज़रूरी हिस्सा अक्सर छूट जाता है।"),
        ("Nagrik faisle hone se pehle apni zarooratein kaise bataayein,",
         "नागरिक फ़ैसले होने से पहले अपनी ज़रूरतें कैसे बताएँ,"),
        ("aur un faislon mein apni baat kaise rakhein?",
         "और उन फ़ैसलों में अपनी बात कैसे रखें?"),
    ]),
    (5, [
        ("Iske liye city sarkaron ko chaar zaroori vaade karne honge.",
         "इसके लिए सिटी सरकारों को चार ज़रूरी वादे करने होंगे।"),
        ("Pehla vaada: LISTEN, yaani nagrikon ki zarooraton ko sunna.",
         "पहला वादा: Listen. यानी, नागरिकों की ज़रूरतों को सुनना।"),
    ]),
    (6, [
        ("Ek achhi bhagidaari ka safar nagrik se shuru hota hai.",
         "एक अच्छी भागीदारी का सफ़र नागरिक से शुरू होता है।"),
        ("Maan lijiye, ek mahila ko lagta hai",
         "मान लीजिए, एक महिला को लगता है"),
        ("ki uske mohalle mein ek public garden hona chahiye.",
         "कि उसके मोहल्ले में एक पब्लिक गार्डन होना चाहिए।"),
    ]),
    (7, [
        ("Ek digital \"Needs and Wants\" portal par",
         "एक डिजिटल \"नीड्स एंड वॉन्ट्स\" पोर्टल पर"),
        ("wo apna ye vichaar proposal ke roop mein rakh sakti hai,",
         "वो अपना ये विचार प्रपोज़ल के रूप में रख सकती है,"),
    ]),
    (8, [
        ("aur mohalle ke baaki log us proposal ka samarthan kar sakte hain,",
         "और मोहल्ले के बाकी लोग उस प्रपोज़ल का समर्थन कर सकते हैं,"),
        ("aur apni zarooratein bhi rakh sakte hain.",
         "और अपनी ज़रूरतें भी रख सकते हैं।"),
    ]),
    (9, [
        ("Iske baad city ke adhikari in sabki saamuhik zarooraton ko dekh sakte hain,",
         "इसके बाद सिटी के अधिकारी इन सबकी सामूहिक ज़रूरतों को देख सकते हैं,"),
        ("aur local development aur budget planning ke samay inpar vichaar kar sakte hain.",
         "और लोकल डेवलपमेंट और बजट प्लानिंग के समय इनपर विचार कर सकते हैं।"),
    ]),
    (10, [
        ("Isse nagrik sirf faisla hone ke baad nahi,",
         "इससे नागरिक सिर्फ़ फ़ैसला होने के बाद नहीं,"),
        ("balki praathmiktaayein tay hote samay hi apni baat rakh paate hain.",
         "बल्कि प्राथमिकताएँ तय होते समय ही अपनी बात रख पाते हैं।"),
        ("Lekin nagrikon ko kaise pata chale ki aage kya hua?",
         "लेकिन नागरिकों को कैसे पता चले कि आगे क्या हुआ?"),
        ("Yahin se aata hai agla vaada.", "यहीं से आता है अगला वादा।"),
    ]),
    (11, [
        ("Doosra vaada: INFORM,", "दूसरा वादा: Inform."),
        ("yaani transparent aur aasaani se milne wale data ke zariye jaankari dena.",
         "यानी, ट्रांसपेरेंट और आसानी से मिलने वाले डेटा के ज़रिए जानकारी देना।"),
    ]),
    (12, [
        ("Open Data Portal aur dashboard ke zariye",
         "ओपन डेटा पोर्टल और डैशबोर्ड के ज़रिए"),
        ("nagrik city sarkar ke plans, budget, timelines",
         "नागरिक सिटी सरकार के प्लान्स, बजट, टाइमलाइन्स"),
        ("aur chal rahe projects ki jaankari dekh sakte hain.",
         "और चल रहे प्रोजेक्ट्स की जानकारी देख सकते हैं।"),
    ]),
    (13, [
        ("Nagrik apne proposal ki pragati,", "नागरिक अपने प्रपोज़ल की प्रगति,"),
        ("aur apne ilaake ke baaki projects ko bhi track kar sakte hain.",
         "और अपने इलाके के बाकी प्रोजेक्ट्स को भी ट्रैक कर सकते हैं।"),
    ]),
    (14, [("Lekin agar nagrik santusht na hon, tab kya?",
           "लेकिन अगर नागरिक संतुष्ट न हों, तब क्या?")]),
    (15, [
        ("Yahin aata hai teesra vaada: RESPOND,", "यहीं आता है तीसरा वादा: Respond."),
        ("yaani ek prabhaavi shikayat nivaaran system ke zariye jawab dena.",
         "यानी, एक प्रभावी शिकायत निवारण सिस्टम के ज़रिए जवाब देना।"),
    ]),
    (16, [
        ("Ek centralised complaint system nagrikon ko ek hi aasaan platform deta hai.",
         "एक सेंट्रलाइज़्ड कंप्लेंट सिस्टम नागरिकों को एक ही आसान प्लेटफ़ॉर्म देता है।"),
        ("Yahan wo complaint darj kar sakte hain,",
         "यहाँ वो कंप्लेंट दर्ज कर सकते हैं,"),
        ("uski acknowledgement yaani paavti paa sakte hain,",
         "उसकी एक्नॉलेजमेंट, यानी पावती, पा सकते हैं,"),
        ("uska samaadhan track kar sakte hain,",
         "उसका समाधान ट्रैक कर सकते हैं,"),
        ("aur jaan sakte hain ki kaunsa vibhaag iske liye zimmedar hai.",
         "और जान सकते हैं कि कौनसा विभाग इसके लिए ज़िम्मेदार है।"),
    ]),
    (17, [
        ("City sarkar ko samay par kaam karna chahiye,",
         "सिटी सरकार को समय पर काम करना चाहिए,"),
        ("aur har kadam par saaf jaankari deni chahiye.",
         "और हर कदम पर साफ़ जानकारी देनी चाहिए।"),
        ("Aur samasya hal hone ke baad nagrik us kaam ki quality par feedback de sakein,",
         "और समस्या हल होने के बाद नागरिक उस काम की क्वालिटी पर फ़ीडबैक दे सकें,"),
        ("taaki complaint sirf band na ho, balki sach mein hal ho.",
         "ताकि कंप्लेंट सिर्फ़ बंद न हो, बल्कि सच में हल हो।"),
    ]),
    (18, [
        ("Aur ant mein, chautha vaada: FACILITATE,", "और अंत में, चौथा वादा: Facilitate."),
        ("yaani digital transaction systems ke zariye kaam aasaan banana.",
         "यानी, डिजिटल ट्रांज़ैक्शन सिस्टम्स के ज़रिए काम आसान बनाना।"),
    ]),
    (19, [
        ("Ek single window digital system", "एक सिंगल विंडो डिजिटल सिस्टम"),
        ("municipal corporation ke saath har kaam ko aasaan banata hai.",
         "म्युनिसिपल कॉर्पोरेशन के साथ हर काम को आसान बनाता है।"),
        ("Property tax bharne se lekar licence ke liye apply karne tak,",
         "प्रॉपर्टी टैक्स भरने से लेकर लाइसेंस के लिए अप्लाई करने तक,"),
        ("nagrik saari municipal sevaayein online le sakte hain,",
         "नागरिक सारी म्युनिसिपल सेवाएँ ऑनलाइन ले सकते हैं,"),
        ("aur unhe alag-alag daftaron ke chakkar nahi lagaane padte.",
         "और उन्हें अलग-अलग दफ़्तरों के चक्कर नहीं लगाने पड़ते।"),
    ]),
    (21, [
        ("Iske liye property tax ka system bhi mazboot hona chahiye:",
         "इसके लिए प्रॉपर्टी टैक्स का सिस्टम भी मज़बूत होना चाहिए:"),
        ("har property ka digital database, GIS technology,",
         "हर प्रॉपर्टी का डिजिटल डेटाबेस, जी-आई-एस टेक्नोलॉजी,"),
        ("saaf aur transparent valuation, self-assessment ki suvidha,",
         "साफ़ और ट्रांसपेरेंट वैल्यूएशन, सेल्फ़-असेसमेंट की सुविधा,"),
        ("samay-samay par revision, aur sevaaon ko tax data se jodna.",
         "समय-समय पर रिवीज़न, और सेवाओं को टैक्स डेटा से जोड़ना।"),
    ]),
    (20, [
        ("Aaj digital technology in chaaron hisson ko",
         "आज डिजिटल टेक्नोलॉजी इन चारों हिस्सों को"),
        ("nagrik bhagidaari ke ek lagaataar safar mein jod sakti hai.",
         "नागरिक भागीदारी के एक लगातार सफ़र में जोड़ सकती है।"),
        ("Isse shehar nagrikon ki baat sun sakte hain, unhe jaankari de sakte hain,",
         "इससे शहर नागरिकों की बात सुन सकते हैं, उन्हें जानकारी दे सकते हैं,"),
        ("unki praathmiktaaon par kaam kar sakte hain,",
         "उनकी प्राथमिकताओं पर काम कर सकते हैं,"),
        ("aur unki shikayaton ka hal nikaal sakte hain.",
         "और उनकी शिकायतों का हल निकाल सकते हैं।"),
        ("Kai Bharatiya shehar pehle se hi achhe udaaharan pesh kar rahe hain.",
         "कई भारतीय शहर पहले से ही अच्छे उदाहरण पेश कर रहे हैं।"),
    ]),
    (22, [
        ("Pune ka Open Data Portal shehar ki jaankari sabke liye aasaan banata hai,",
         "पुणे का ओपन डेटा पोर्टल शहर की जानकारी सबके लिए आसान बनाता है,"),
        ("aur Mumbai mein BMC ka WhatsApp chatbot",
         "और मुंबई में BMC का व्हाट्सऐप चैटबॉट"),
        ("municipal sevaaon tak pahunch ko aasaan karta hai.",
         "म्युनिसिपल सेवाओं तक पहुँच को आसान करता है।"),
        ("Ye pahal raasta dikhati hain,", "ये पहल रास्ता दिखाती हैं,"),
    ]),
    (23, [
        ("lekin ek sach mein smart city sirf apni technology se nahi pehchaani jaati.",
         "लेकिन एक सच में स्मार्ट सिटी सिर्फ़ अपनी टेक्नोलॉजी से नहीं पहचानी जाती।"),
        ("Wo pehchaani jaati hai responsive, transparent aur participatory hone se,",
         "वो पहचानी जाती है रिस्पॉन्सिव, ट्रांसपेरेंट और पार्टिसिपेटरी होने से,"),
        ("yaani jo jawab de, jo kuch na chhupaaye, aur jo sabko saath le.",
         "यानी जो जवाब दे, जो कुछ न छुपाए, और जो सबको साथ ले।"),
    ]),
    (24, [
        ("Jab city sarkarein sunti hain, jaankari deti hain,",
         "जब सिटी सरकारें सुनती हैं, जानकारी देती हैं,"),
        ("jawab deti hain aur kaam aasaan banati hain,",
         "जवाब देती हैं और काम आसान बनाती हैं,"),
        ("tab nagrik local governance mein sakriya saajhedaar ban jaate hain.",
         "तब नागरिक लोकल गवर्नेंस में सक्रिय साझेदार बन जाते हैं।"),
    ]),
    (25, [
        ("Saath milkar, wo aaj ki zarooraton ko", "साथ मिलकर, वो आज की ज़रूरतों को"),
        ("kal ke un shehron mein badal sakte hain, jinmein hum rehna chahte hain.",
         "कल के उन शहरों में बदल सकते हैं, जिनमें हम रहना चाहते हैं।"),
    ]),
]

# slides voiced together with the slide before them (no pause, just a slide change)
JOIN = {8, 23}
