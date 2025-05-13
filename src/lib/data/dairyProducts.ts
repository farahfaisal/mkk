export interface DairyProduct {
  id: string;
  name: string;
  hebrewName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'milk' | 'yogurt' | 'cheese' | 'cream' | 'butter' | 'icecream' | 'substitute' | 'other';
}

export const dairyProducts: DairyProduct[] = [
  {
    id: 'dairy-1',
    name: 'مصل اللبن، حمضي، سائل',
    hebrewName: 'מי גבינה, חומצי, נוזלי',
    calories: 24,
    protein: 0.8,
    carbs: 5.1,
    fat: 0.1,
    category: 'milk'
  },
  {
    id: 'dairy-2',
    name: 'برغل مطبوخ مع فاصوليا بيضاء وطماطم',
    hebrewName: 'בורגול, מבושל עם שעועית לבנה ועגבניות',
    calories: 112,
    protein: 5.3,
    carbs: 15.3,
    fat: 1.7,
    category: 'other'
  },
  {
    id: 'dairy-3',
    name: 'حليب بشري',
    hebrewName: 'חלב אם',
    calories: 70,
    protein: 1,
    carbs: 6.9,
    fat: 4.4,
    category: 'milk'
  },
  {
    id: 'dairy-4',
    name: 'حليب بقر، 3% دهون',
    hebrewName: 'חלב 3% שומן, תנובה, טרה, הרדוף, יטבתה',
    calories: 60,
    protein: 3.3,
    carbs: 4.6,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-5',
    name: 'حليب بقر، 1% دهون، مدعم بالكالسيوم',
    hebrewName: 'חלב 1% שומן בקרטון מועשר ויטמין A,D, וסידן',
    calories: 42,
    protein: 3,
    carbs: 4.6,
    fat: 1,
    category: 'milk'
  },
  {
    id: 'dairy-6',
    name: 'حليب بقر، 3% دهون، مدعم بالكالسيوم',
    hebrewName: 'חלב 3% שומן, מועשר בסידן, תנובה,טרה,יטבתה',
    calories: 58,
    protein: 3.2,
    carbs: 4.6,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-7',
    name: 'حليب بقر، 3% دهون، مدعم بالفيتامينات',
    hebrewName: 'חלב 3% שומן, מועשר בויטמינים B12, D,E, יטבתה',
    calories: 57,
    protein: 3,
    carbs: 4.7,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-8',
    name: 'حليب بقر، 1% دهون',
    hebrewName: 'חלב 1% שומן, תנובה, טרה, הרדוף, יטבתה',
    calories: 43,
    protein: 3.3,
    carbs: 5.1,
    fat: 1,
    category: 'milk'
  },
  {
    id: 'dairy-9',
    name: 'مشروب حليب، 3% دهون، فانيلا/موز/موكا',
    hebrewName: 'משקה חלב בטעם וניל,3% שומן, טרה',
    calories: 86,
    protein: 2.5,
    carbs: 12,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-10',
    name: 'حليب بقر، 3% دهون، قليل اللاكتوز',
    hebrewName: 'חלב 2% שומן, כולל דל לקטוז, תנובה',
    calories: 51,
    protein: 3.2,
    carbs: 4.9,
    fat: 2,
    category: 'milk'
  },
  {
    id: 'dairy-11',
    name: 'حليب ماعز، سائل، كامل الدسم',
    hebrewName: 'חלב עזים 4% שומן',
    calories: 69,
    protein: 3.6,
    carbs: 4.5,
    fat: 4.1,
    category: 'milk'
  },
  {
    id: 'dairy-12',
    name: 'حليب ماعز، 3.7% دهون',
    hebrewName: 'חלב עזים 3.7% שומן, צוריאל',
    calories: 66,
    protein: 3,
    carbs: 4.7,
    fat: 3.7,
    category: 'milk'
  },
  {
    id: 'dairy-13',
    name: 'حليب غنم، 7% دهون',
    hebrewName: 'חלב כבשים 7% שומן',
    calories: 108,
    protein: 6,
    carbs: 5.4,
    fat: 7,
    category: 'milk'
  },
  {
    id: 'dairy-14',
    name: 'حليب إبل',
    hebrewName: 'חלב נאקות (גמלים)',
    calories: 58,
    protein: 3.1,
    carbs: 4.7,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-15',
    name: 'حليب مجفف، معاد تكوينه، كامل الدسم',
    hebrewName: 'חלב מיובש, מלא, משוחזר',
    calories: 61,
    protein: 3.2,
    carbs: 4.7,
    fat: 3.3,
    category: 'milk'
  },
  {
    id: 'dairy-16',
    name: 'زبادي، 4.5% دهون',
    hebrewName: 'יוגורט 4.5% שומן, תנובה',
    calories: 68,
    protein: 3.3,
    carbs: 3.5,
    fat: 4.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-17',
    name: 'زبادي، 1.5% دهون',
    hebrewName: 'יוגורט 1.5% שומן, תנובה',
    calories: 48,
    protein: 3.6,
    carbs: 4.3,
    fat: 1.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-18',
    name: 'زبادي، عادي، 3% دهون',
    hebrewName: 'יוגורט טבעי 3% שומן',
    calories: 65,
    protein: 4.7,
    carbs: 4.7,
    fat: 3,
    category: 'yogurt'
  },
  {
    id: 'dairy-19',
    name: 'زبادي، 3% دهون، بروبيوتيك، مع فاكهة',
    hebrewName: 'יוגורט פרוביוטי עם פרי 3% שומן',
    calories: 115,
    protein: 3.8,
    carbs: 18.2,
    fat: 3,
    category: 'yogurt'
  },
  {
    id: 'dairy-20',
    name: 'زبادي، 0% دهون، مع فاكهة',
    hebrewName: 'יוגורט עם פרי 0% שומן',
    calories: 40,
    protein: 4.8,
    carbs: 4.9,
    fat: 0,
    category: 'yogurt'
  },
  {
    id: 'dairy-21',
    name: 'زبادي، 1.5% دهون، فانيلا',
    hebrewName: 'יוגורט בטעם וניל 1.5% שומן',
    calories: 93,
    protein: 3.7,
    carbs: 16,
    fat: 1.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-22',
    name: 'مشروب زبادي، 1.5% دهون، فراولة',
    hebrewName: 'משקה יוגורט בטעם תות 1.5% שומן',
    calories: 94,
    protein: 3.1,
    carbs: 17.2,
    fat: 1.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-23',
    name: 'جبنة قريش، 5% دهون',
    hebrewName: 'גבינה לבנה 5% שומן (קוטג׳)',
    calories: 91,
    protein: 8,
    carbs: 3.5,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-24',
    name: 'جبنة كريمية، 9% دهون',
    hebrewName: 'גבינה לבנה 9% שומן',
    calories: 127,
    protein: 8,
    carbs: 3.5,
    fat: 9,
    category: 'cheese'
  },
  {
    id: 'dairy-25',
    name: 'جبنة كريمية، 5% دهون',
    hebrewName: 'גבינה לבנה 5% שומן',
    calories: 91,
    protein: 9.5,
    carbs: 2,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-26',
    name: 'جبنة كوارك، 5% دهون',
    hebrewName: 'גבינת קוואקר 5% שומן',
    calories: 91,
    protein: 9.5,
    carbs: 2,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-27',
    name: 'جبنة بلغارية، 5% دهون',
    hebrewName: 'גבינה בולגרית 5% שומן',
    calories: 91,
    protein: 9.5,
    carbs: 2,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-28',
    name: 'جبنة بلغارية، 16% دهون',
    hebrewName: 'גבינה בולגרית 16% שומן',
    calories: 166,
    protein: 9,
    carbs: 1.1,
    fat: 16,
    category: 'cheese'
  },
  {
    id: 'dairy-29',
    name: 'جبنة على طراز فيتا، 5% دهون',
    hebrewName: 'גבינה בסגנון פטה 5% שומן',
    calories: 91,
    protein: 9.5,
    carbs: 2,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-30',
    name: 'جبنة على طراز فيتا، 16% دهون',
    hebrewName: 'גבינה בסגנון פטה 16% שומן',
    calories: 166,
    protein: 9,
    carbs: 1.1,
    fat: 16,
    category: 'cheese'
  },
  {
    id: 'dairy-31',
    name: 'جبنة صلبة، صفراء، 28% دهون',
    hebrewName: 'גבינה קשה צהובה 28% שומן',
    calories: 350,
    protein: 25,
    carbs: 2,
    fat: 28,
    category: 'cheese'
  },
  {
    id: 'dairy-32',
    name: 'جبنة صلبة، صفراء، 22% دهون',
    hebrewName: 'גבינה קשה צהובה 22% שומן',
    calories: 300,
    protein: 25,
    carbs: 2,
    fat: 22,
    category: 'cheese'
  },
  {
    id: 'dairy-33',
    name: 'جبنة صلبة، صفراء، 9% دهون',
    hebrewName: 'גבינה קשה צהובה 9% שומן',
    calories: 200,
    protein: 25,
    carbs: 2,
    fat: 9,
    category: 'cheese'
  },
  {
    id: 'dairy-34',
    name: 'جبنة بارميزان',
    hebrewName: 'גבינת פרמזן',
    calories: 420,
    protein: 38,
    carbs: 3.2,
    fat: 29,
    category: 'cheese'
  },
  {
    id: 'dairy-35',
    name: 'جبنة موزاريلا',
    hebrewName: 'גבינת מוצרלה',
    calories: 280,
    protein: 22,
    carbs: 2.2,
    fat: 22,
    category: 'cheese'
  },
  {
    id: 'dairy-36',
    name: 'جبنة موزاريلا، لايت',
    hebrewName: 'גבינת מוצרלה לייט',
    calories: 200,
    protein: 22,
    carbs: 2.2,
    fat: 12,
    category: 'cheese'
  },
  {
    id: 'dairy-37',
    name: 'جبنة كاشكافال',
    hebrewName: 'גבינת קשקבל',
    calories: 350,
    protein: 25,
    carbs: 2,
    fat: 28,
    category: 'cheese'
  },
  {
    id: 'dairy-38',
    name: 'جبنة شيدر',
    hebrewName: 'גבינת צ׳דר',
    calories: 400,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    category: 'cheese'
  },
  {
    id: 'dairy-39',
    name: 'جبنة جودا',
    hebrewName: 'גבינת גאודה',
    calories: 350,
    protein: 25,
    carbs: 2.2,
    fat: 27,
    category: 'cheese'
  },
  {
    id: 'dairy-40',
    name: 'جبنة روكفور',
    hebrewName: 'גבינת רוקפור',
    calories: 370,
    protein: 21.5,
    carbs: 2,
    fat: 30.6,
    category: 'cheese'
  },
  {
    id: 'dairy-41',
    name: 'جبنة بري',
    hebrewName: 'גבינת ברי',
    calories: 330,
    protein: 20.8,
    carbs: 0.5,
    fat: 27.7,
    category: 'cheese'
  },
  {
    id: 'dairy-42',
    name: 'جبنة كاممبير',
    hebrewName: 'גבינת קממבר',
    calories: 300,
    protein: 19.8,
    carbs: 0.5,
    fat: 24.3,
    category: 'cheese'
  },
  {
    id: 'dairy-43',
    name: 'جبنة ريكوتا',
    hebrewName: 'גבינת ריקוטה',
    calories: 174,
    protein: 11.3,
    carbs: 3.8,
    fat: 12.9,
    category: 'cheese'
  },
  {
    id: 'dairy-44',
    name: 'جبنة ماسكاربوني',
    hebrewName: 'גבינת מסקרפונה',
    calories: 420,
    protein: 4.3,
    carbs: 3.6,
    fat: 42.1,
    category: 'cheese'
  },
  {
    id: 'dairy-45',
    name: 'جبنة كريمية، 16% دهون',
    hebrewName: 'גבינת שמנת 16% שומן',
    calories: 166,
    protein: 9,
    carbs: 1.1,
    fat: 16,
    category: 'cheese'
  },
  {
    id: 'dairy-46',
    name: 'جبنة كريمية، 24% دهون',
    hebrewName: 'גבינת שמנת 24% שומן',
    calories: 240,
    protein: 9,
    carbs: 1.1,
    fat: 24,
    category: 'cheese'
  },
  {
    id: 'dairy-47',
    name: 'جبنة قابلة للدهن، 9% دهون',
    hebrewName: 'ממרח גבינה 9% שומן',
    calories: 127,
    protein: 8,
    carbs: 3.5,
    fat: 9,
    category: 'cheese'
  },
  {
    id: 'dairy-48',
    name: 'جبنة قابلة للدهن، 16% دهون',
    hebrewName: 'ממרח גבינה 16% שומן',
    calories: 166,
    protein: 9,
    carbs: 1.1,
    fat: 16,
    category: 'cheese'
  },
  {
    id: 'dairy-49',
    name: 'كريمة حامضة، 15% دهون',
    hebrewName: 'שמנת חמוצה 15% שומן',
    calories: 170,
    protein: 2.5,
    carbs: 3.5,
    fat: 15,
    category: 'cream'
  },
  {
    id: 'dairy-50',
    name: 'كريمة حامضة، 27% دهون',
    hebrewName: 'שמנת חמוצה 27% שומן',
    calories: 270,
    protein: 2.5,
    carbs: 3.5,
    fat: 27,
    category: 'cream'
  },
  {
    id: 'dairy-51',
    name: 'كريمة حلوة، 38% دهون',
    hebrewName: 'שמנת מתוקה 38% שומן',
    calories: 380,
    protein: 2.1,
    carbs: 3.1,
    fat: 38,
    category: 'cream'
  },
  {
    id: 'dairy-52',
    name: 'زبدة، مملحة',
    hebrewName: 'חמאה עם מלח',
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    category: 'butter'
  },
  {
    id: 'dairy-53',
    name: 'زبدة، غير مملحة',
    hebrewName: 'חמאה ללא מלח',
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    category: 'butter'
  },
  {
    id: 'dairy-54',
    name: 'بديل حليب، صويا، محلى',
    hebrewName: 'תחליף חלב סויה ממותק',
    calories: 54,
    protein: 3.3,
    carbs: 4.5,
    fat: 2.3,
    category: 'substitute'
  },
  {
    id: 'dairy-55',
    name: 'بديل حليب، لوز',
    hebrewName: 'תחליף חלב שקדים',
    calories: 30,
    protein: 1.1,
    carbs: 3.5,
    fat: 1.5,
    category: 'substitute'
  },
  {
    id: 'dairy-56',
    name: 'بديل حليب، أرز',
    hebrewName: 'תחליף חלב אורז',
    calories: 47,
    protein: 0.3,
    carbs: 9.2,
    fat: 1,
    category: 'substitute'
  },
  {
    id: 'dairy-57',
    name: 'بديل حليب، شوفان',
    hebrewName: 'תחליף חלב שיבולת שועל',
    calories: 45,
    protein: 1.5,
    carbs: 7.5,
    fat: 1.5,
    category: 'substitute'
  },
  {
    id: 'dairy-58',
    name: 'آيس كريم، فانيلا',
    hebrewName: 'גלידת וניל',
    calories: 207,
    protein: 3.5,
    carbs: 23.6,
    fat: 11,
    category: 'icecream'
  },
  {
    id: 'dairy-59',
    name: 'آيس كريم، شوكولاتة',
    hebrewName: 'גלידת שוקולד',
    calories: 216,
    protein: 3.8,
    carbs: 24,
    fat: 11.5,
    category: 'icecream'
  },
  {
    id: 'dairy-60',
    name: 'آيس كريم، فراولة',
    hebrewName: 'גלידת תות',
    calories: 192,
    protein: 3.2,
    carbs: 24.8,
    fat: 9.5,
    category: 'icecream'
  },
  {
    id: 'dairy-61',
    name: 'آيس كريم، فستق',
    hebrewName: 'גלידת פיסטוק',
    calories: 220,
    protein: 4.5,
    carbs: 22.5,
    fat: 12.5,
    category: 'icecream'
  },
  {
    id: 'dairy-62',
    name: 'آيس كريم، مانجو',
    hebrewName: 'גלידת מנגו',
    calories: 180,
    protein: 2.8,
    carbs: 26,
    fat: 8.5,
    category: 'icecream'
  },
  {
    id: 'dairy-63',
    name: 'آيس كريم، ليمون',
    hebrewName: 'גלידת לימון',
    calories: 160,
    protein: 2,
    carbs: 28,
    fat: 5,
    category: 'icecream'
  },
  {
    id: 'dairy-64',
    name: 'آيس كريم، قهوة',
    hebrewName: 'גלידת קפה',
    calories: 200,
    protein: 3.5,
    carbs: 23,
    fat: 10.5,
    category: 'icecream'
  },
  {
    id: 'dairy-65',
    name: 'آيس كريم، زبادي',
    hebrewName: 'גלידת יוגורט',
    calories: 190,
    protein: 5.8,
    carbs: 33.2,
    fat: 6.4,
    category: 'icecream'
  },
  {
    id: 'dairy-66',
    name: 'آيس كريم، قليل الدسم',
    hebrewName: 'גלידה דלת שומן',
    calories: 150,
    protein: 3.5,
    carbs: 28,
    fat: 3,
    category: 'icecream'
  },
  {
    id: 'dairy-67',
    name: 'آيس كريم، سوربيه',
    hebrewName: 'סורבה',
    calories: 130,
    protein: 0.5,
    carbs: 32,
    fat: 0,
    category: 'icecream'
  },
  {
    id: 'dairy-68',
    name: 'ميلك شيك، شوكولاتة',
    hebrewName: 'מילקשייק שוקולד',
    calories: 230,
    protein: 8,
    carbs: 35,
    fat: 6,
    category: 'other'
  },
  {
    id: 'dairy-69',
    name: 'ميلك شيك، فانيلا',
    hebrewName: 'מילקשייק וניל',
    calories: 210,
    protein: 8,
    carbs: 32,
    fat: 5.5,
    category: 'other'
  },
  {
    id: 'dairy-70',
    name: 'ميلك شيك، موز',
    hebrewName: 'מילקשייק בננה',
    calories: 220,
    protein: 7.5,
    carbs: 36,
    fat: 5,
    category: 'other'
  },
  {
    id: 'dairy-71',
    name: 'ميلك شيك، فراولة',
    hebrewName: 'מילקשייק תות',
    calories: 215,
    protein: 7.5,
    carbs: 35,
    fat: 5,
    category: 'other'
  },
  {
    id: 'dairy-72',
    name: 'مشروب زبادي، بروبيوتيك',
    hebrewName: 'משקה יוגורט פרוביוטי',
    calories: 96,
    protein: 2.9,
    carbs: 17,
    fat: 1.8,
    category: 'yogurt'
  },
  {
    id: 'dairy-73',
    name: 'مشروب زبادي، فانيلا',
    hebrewName: 'משקה יוגורט וניל',
    calories: 96,
    protein: 2.9,
    carbs: 17,
    fat: 1.8,
    category: 'yogurt'
  },
  {
    id: 'dairy-74',
    name: 'مشروب زبادي، مانجو',
    hebrewName: 'משקה יוגורט מנגו',
    calories: 96,
    protein: 2.9,
    carbs: 17,
    fat: 1.8,
    category: 'yogurt'
  },
  {
    id: 'dairy-75',
    name: 'مشروب زبادي، قهوة',
    hebrewName: 'משקה יוגורט קפה',
    calories: 96,
    protein: 2.9,
    carbs: 17,
    fat: 1.8,
    category: 'yogurt'
  },
  {
    id: 'dairy-76',
    name: 'كريمة مخفوقة',
    hebrewName: 'קצפת',
    calories: 257,
    protein: 2.2,
    carbs: 7.5,
    fat: 25,
    category: 'cream'
  },
  {
    id: 'dairy-77',
    name: 'كريمة خفيفة',
    hebrewName: 'שמנת קלה',
    calories: 120,
    protein: 2.5,
    carbs: 3.5,
    fat: 10,
    category: 'cream'
  },
  {
    id: 'dairy-78',
    name: 'جبنة خفيفة',
    hebrewName: 'גבינה קלה',
    calories: 150,
    protein: 20,
    carbs: 2,
    fat: 7,
    category: 'cheese'
  },
  {
    id: 'dairy-79',
    name: 'جبنة خالية من اللاكتوز',
    hebrewName: 'גבינה ללא לקטוז',
    calories: 300,
    protein: 25,
    carbs: 2,
    fat: 22,
    category: 'cheese'
  },
  {
    id: 'dairy-80',
    name: 'زبادي خالي من اللاكتوز',
    hebrewName: 'יוגורט ללא לקטוז',
    calories: 65,
    protein: 4.7,
    carbs: 4.7,
    fat: 3,
    category: 'yogurt'
  },
  {
    id: 'dairy-81',
    name: 'حليب خالي من اللاكتوز',
    hebrewName: 'חלב ללא לקטוז',
    calories: 60,
    protein: 3.3,
    carbs: 4.6,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-82',
    name: 'زبدة مصفاة',
    hebrewName: 'חמאה מזוקקת',
    calories: 876,
    protein: 0.3,
    carbs: 0,
    fat: 99.5,
    category: 'butter'
  },
  {
    id: 'dairy-83',
    name: 'سمن',
    hebrewName: 'גהי',
    calories: 876,
    protein: 0.3,
    carbs: 0,
    fat: 99.5,
    category: 'butter'
  },
  {
    id: 'dairy-84',
    name: 'مسحوق بروتين مصل اللبن',
    hebrewName: 'אבקת חלבון מי גבינה',
    calories: 400,
    protein: 80,
    carbs: 10,
    fat: 7,
    category: 'other'
  },
  {
    id: 'dairy-85',
    name: 'مسحوق بروتين كازين',
    hebrewName: 'אבקת חלבון קזאין',
    calories: 370,
    protein: 80,
    carbs: 7,
    fat: 3.5,
    category: 'other'
  },
  {
    id: 'dairy-86',
    name: 'مشروب بروتين، فانيلا',
    hebrewName: 'משקה חלבון וניל',
    calories: 160,
    protein: 30,
    carbs: 5,
    fat: 2.5,
    category: 'other'
  },
  {
    id: 'dairy-87',
    name: 'تركيبة للرضع، ليلة طيبة، قوام سميك',
    hebrewName: 'תמ״ל, מטרנה לילה טוב, בהכנה סמיכה',
    calories: 506,
    protein: 11,
    carbs: 58.5,
    fat: 25.3,
    category: 'other'
  },
  {
    id: 'dairy-88',
    name: 'تركيبة للرضع، ألبان، المرحلة 1، مسحوق',
    hebrewName: 'תמ״ל, חלבי שלב 1, כולל מהדרין, אבקה, מטרנה',
    calories: 500,
    protein: 10.5,
    carbs: 57,
    fat: 25,
    category: 'other'
  },
  {
    id: 'dairy-89',
    name: 'تركيبة للرضع، ألبان، المرحلة 2، مسحوق',
    hebrewName: 'תמ״ל, חלבי שלב 2, כולל מהדרין, אבקה, מטרנה',
    calories: 500,
    protein: 11,
    carbs: 56,
    fat: 25,
    category: 'other'
  },
  {
    id: 'dairy-90',
    name: 'تركيبة للرضع، ألبان، المرحلة 3، مسحوق',
    hebrewName: 'תמ״ל, חלבי שלב 3, כולל מהדרין, אבקה, מטרנה',
    calories: 500,
    protein: 11.5,
    carbs: 55,
    fat: 25,
    category: 'other'
  },
  {
    id: 'dairy-91',
    name: 'تركيبة للرضع، غير ألبان، من عمر سنة، جاهزة للشرب',
    hebrewName: 'תמ״ל, מטרנה צמחית עד גיל שנה, מוכן',
    calories: 67,
    protein: 1.6,
    carbs: 7.3,
    fat: 3.5,
    category: 'substitute'
  },
  {
    id: 'dairy-92',
    name: 'بودينغ حليب، 1.5% دهون، شوكولاتة',
    hebrewName: 'מעדן חלב 1.5% שומן, שוקולד, דני, שקשק, שטראוס',
    calories: 120,
    protein: 3.5,
    carbs: 22,
    fat: 1.5,
    category: 'other'
  },
  {
    id: 'dairy-93',
    name: 'بودينغ حليب، 3% دهون، شوكولاتة',
    hebrewName: 'מעדן חלב 3% שומן, שוקולד, שטראוס, טרה',
    calories: 140,
    protein: 3.5,
    carbs: 22,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-94',
    name: 'بودينغ حليب، 3% دهون، فانيلا',
    hebrewName: 'מעדן חלב 1.5% שומן, וניל, דני/קרלו, שטראוס,תנובה',
    calories: 130,
    protein: 3.5,
    carbs: 20,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-95',
    name: 'بودينغ حليب مع أرز، فانيلا',
    hebrewName: 'מעדן חלב עם אורז, ירח מתוק, בטעם וניל, גד',
    calories: 150,
    protein: 3,
    carbs: 25,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-96',
    name: 'بودينغ حليب، 3% دهون، فراولة/خوخ/أناناس',
    hebrewName: 'מעדן חלב, באדי, 3% שומן, תות /אפרסק/אננס, תנובה',
    calories: 135,
    protein: 3.5,
    carbs: 21,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-97',
    name: 'بودينغ حليب، 4% دهون، موز',
    hebrewName: 'מעדן חלב, ג׳ננה פונץ׳ בננה 4% שומן, חצי חצי, טרה',
    calories: 145,
    protein: 3.5,
    carbs: 22,
    fat: 4,
    category: 'other'
  },
  {
    id: 'dairy-98',
    name: 'بودينغ حليب، 6-12% دهون، مع كريمة، شوكولاتة',
    hebrewName: 'מעדן חלב עם קצפת 6-12% שומן, מילקי שוקו, סוגים שונים, שטראוס',
    calories: 200,
    protein: 3.5,
    carbs: 25,
    fat: 8,
    category: 'other'
  },
  {
    id: 'dairy-99',
    name: 'بودينغ حليب، مهلبية',
    hebrewName: 'מלבי, רוזטה מלבי, מעדן חלב, עדן קינוחים, גד',
    calories: 140,
    protein: 3,
    carbs: 22,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-100',
    name: 'بودينغ حليب 0% دهون، شوكولاتة/فانيلا، مع محلي',
    hebrewName: 'מעדן חלב 0% שומן, שוקולד/וניל עם ממתיק דל קלוריות, טוויגי, תנובה',
    calories: 90,
    protein: 3.5,
    carbs: 15,
    fat: 0,
    category: 'other'
  },
  {
    id: 'dairy-101',
    name: 'حلوى حليب أو حلوى حليب (دولسي دي ليتشي)',
    hebrewName: 'ריבת חלב',
    calories: 315,
    protein: 7,
    carbs: 55,
    fat: 8,
    category: 'other'
  },
  {
    id: 'dairy-102',
    name: 'سحلب، أساسه الماء، محضر من مسحوق',
    hebrewName: 'סחלב מוכן מאבקה, על בסיס מים',
    calories: 120,
    protein: 1,
    carbs: 25,
    fat: 2,
    category: 'other'
  },
  {
    id: 'dairy-103',
    name: 'موس شوكولاتة، غير ألبان، محضر منزلياً',
    hebrewName: 'מוס שוקולד פרווה עם קצפת צמחית',
    calories: 250,
    protein: 3,
    carbs: 30,
    fat: 12,
    category: 'other'
  },
  {
    id: 'dairy-104',
    name: 'كريم بافاريا، محضر منزلياً',
    hebrewName: 'קרם בוואריה',
    calories: 280,
    protein: 5,
    carbs: 25,
    fat: 18,
    category: 'other'
  },
  {
    id: 'dairy-105',
    name: 'كريم بروليه، محضر منزلياً',
    hebrewName: 'קרם ברולה',
    calories: 300,
    protein: 4,
    carbs: 26,
    fat: 20,
    category: 'other'
  },
  // منتجات إضافية
  {
    id: 'dairy-106',
    name: 'حليب بقر كامل الدسم 3%',
    calories: 60,
    protein: 3.3,
    carbs: 4.6,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-107',
    name: 'حليب بقر قليل الدسم 1%',
    calories: 43,
    protein: 3.3,
    carbs: 5.1,
    fat: 1,
    category: 'milk'
  },
  {
    id: 'dairy-108',
    name: 'حليب ماعز 4%',
    calories: 69,
    protein: 3.6,
    carbs: 4.5,
    fat: 4.1,
    category: 'milk'
  },
  {
    id: 'dairy-109',
    name: 'حليب غنم 7%',
    calories: 108,
    protein: 6,
    carbs: 5.4,
    fat: 7,
    category: 'milk'
  },
  {
    id: 'dairy-110',
    name: 'حليب ناقة',
    calories: 58,
    protein: 3.1,
    carbs: 4.7,
    fat: 3,
    category: 'milk'
  },
  {
    id: 'dairy-111',
    name: 'زبادي كامل الدسم 4.5%',
    calories: 68,
    protein: 3.3,
    carbs: 3.5,
    fat: 4.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-112',
    name: 'زبادي قليل الدسم 1.5%',
    calories: 48,
    protein: 3.6,
    carbs: 4.3,
    fat: 1.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-113',
    name: 'زبادي طبيعي 3%',
    calories: 65,
    protein: 4.7,
    carbs: 4.7,
    fat: 3,
    category: 'yogurt'
  },
  {
    id: 'dairy-114',
    name: 'زبادي خالي الدسم مع الفواكه',
    calories: 40,
    protein: 4.8,
    carbs: 4.9,
    fat: 0,
    category: 'yogurt'
  },
  {
    id: 'dairy-115',
    name: 'مشروب زبادي 1.5%',
    calories: 94,
    protein: 3.1,
    carbs: 17.2,
    fat: 1.5,
    category: 'yogurt'
  },
  {
    id: 'dairy-116',
    name: 'جبنة قريش 5%',
    calories: 91,
    protein: 8,
    carbs: 3.5,
    fat: 5,
    category: 'cheese'
  },
  {
    id: 'dairy-117',
    name: 'جبنة كريمية 9%',
    calories: 127,
    protein: 8,
    carbs: 3.5,
    fat: 9,
    category: 'cheese'
  },
  {
    id: 'dairy-118',
    name: 'جبنة فيتا 16%',
    calories: 166,
    protein: 9,
    carbs: 1.1,
    fat: 16,
    category: 'cheese'
  },
  {
    id: 'dairy-119',
    name: 'جبنة صفراء 28%',
    calories: 350,
    protein: 25,
    carbs: 2,
    fat: 28,
    category: 'cheese'
  },
  {
    id: 'dairy-120',
    name: 'جبنة موزاريلا',
    calories: 280,
    protein: 22,
    carbs: 2.2,
    fat: 22,
    category: 'cheese'
  },
  {
    id: 'dairy-121',
    name: 'جبنة بارميزان',
    calories: 420,
    protein: 38,
    carbs: 3.2,
    fat: 29,
    category: 'cheese'
  },
  {
    id: 'dairy-122',
    name: 'زبدة مملحة',
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    category: 'butter'
  },
  {
    id: 'dairy-123',
    name: 'قشدة حامضة 15%',
    calories: 170,
    protein: 2.5,
    carbs: 3.5,
    fat: 15,
    category: 'cream'
  },
  {
    id: 'dairy-124',
    name: 'قشدة حلوة 38%',
    calories: 380,
    protein: 2.1,
    carbs: 3.1,
    fat: 38,
    category: 'cream'
  },
  {
    id: 'dairy-125',
    name: 'حليب لوز',
    calories: 30,
    protein: 1.1,
    carbs: 3.5,
    fat: 1.5,
    category: 'substitute'
  },
  {
    id: 'dairy-126',
    name: 'حليب صويا',
    calories: 54,
    protein: 3.3,
    carbs: 4.5,
    fat: 2.3,
    category: 'substitute'
  },
  {
    id: 'dairy-127',
    name: 'بروتين مصل اللبن',
    calories: 400,
    protein: 80,
    carbs: 10,
    fat: 7,
    category: 'other'
  },
  {
    id: 'dairy-128',
    name: 'آيس كريم فانيلا',
    calories: 207,
    protein: 3.5,
    carbs: 23.6,
    fat: 11,
    category: 'icecream'
  },
  {
    id: 'dairy-129',
    name: 'آيس كريم شوكولاتة',
    calories: 216,
    protein: 3.8,
    carbs: 24,
    fat: 11.5,
    category: 'icecream'
  },
  {
    id: 'dairy-130',
    name: 'آيس كريم فراولة',
    calories: 192,
    protein: 3.2,
    carbs: 24.8,
    fat: 9.5,
    category: 'icecream'
  },
  {
    id: 'dairy-131',
    name: 'آيس كريم فستق',
    calories: 220,
    protein: 4.5,
    carbs: 22.5,
    fat: 12.5,
    category: 'icecream'
  },
  {
    id: 'dairy-132',
    name: 'آيس كريم مانجو',
    calories: 180,
    protein: 2.8,
    carbs: 26,
    fat: 8.5,
    category: 'icecream'
  },
  {
    id: 'dairy-133',
    name: 'مهلبية',
    calories: 140,
    protein: 3,
    carbs: 22,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-134',
    name: 'رز بالحليب',
    calories: 150,
    protein: 3,
    carbs: 25,
    fat: 3,
    category: 'other'
  },
  {
    id: 'dairy-135',
    name: 'كريم كراميل',
    calories: 200,
    protein: 3.5,
    carbs: 25,
    fat: 8,
    category: 'other'
  },
  {
    id: 'dairy-136',
    name: 'بودينغ الشوكولاتة',
    calories: 220,
    protein: 3.5,
    carbs: 30,
    fat: 10,
    category: 'other'
  },
  {
    id: 'dairy-137',
    name: 'كاسترد',
    calories: 160,
    protein: 4,
    carbs: 20,
    fat: 6,
    category: 'other'
  },
  {
    id: 'dairy-138',
    name: 'حليب بقر، 0% دهون',
    calories: 35,
    protein: 3.4,
    carbs: 5,
    fat: 0,
    category: 'milk'
  },
  {
    id: 'dairy-139',
    name: 'حليب بقر، 2% دهون',
    calories: 50,
    protein: 3.3,
    carbs: 4.8,
    fat: 2,
    category: 'milk'
  },
  {
    id: 'dairy-140',
    name: 'زبادي يوناني، 0% دهون',
    calories: 60,
    protein: 10,
    carbs: 3.6,
    fat: 0,
    category: 'yogurt'
  },
  {
    id: 'dairy-141',
    name: 'زبادي يوناني، 2% دهون',
    calories: 80,
    protein: 10,
    carbs: 3.6,
    fat: 2,
    category: 'yogurt'
  },
  {
    id: 'dairy-142',
    name: 'زبادي يوناني، 5% دهون',
    calories: 100,
    protein: 9,
    carbs: 3.6,
    fat: 5,
    category: 'yogurt'
  },
  {
    id: 'dairy-143',
    name: 'جبنة قريش، 0% دهون',
    calories: 72,
    protein: 13,
    carbs: 3.5,
    fat: 0,
    category: 'cheese'
  },
  {
    id: 'dairy-144',
    name: 'جبنة قريش، 2% دهون',
    calories: 81,
    protein: 12,
    carbs: 3.5,
    fat: 2,
    category: 'cheese'
  },
  {
    id: 'dairy-145',
    name: 'جبنة قريش، 9% دهون',
    calories: 120,
    protein: 11,
    carbs: 3.5,
    fat: 9,
    category: 'cheese'
  },
  {
    id: 'dairy-146',
    name: 'حليب جوز الهند',
    calories: 45,
    protein: 0.5,
    carbs: 2,
    fat: 4.5,
    category: 'substitute'
  },
  {
    id: 'dairy-147',
    name: 'حليب الكاجو',
    calories: 50,
    protein: 1,
    carbs: 7.5,
    fat: 2.5,
    category: 'substitute'
  },
  {
    id: 'dairy-148',
    name: 'حليب الكينوا',
    calories: 40,
    protein: 1.5,
    carbs: 6.5,
    fat: 1,
    category: 'substitute'
  },
  {
    id: 'dairy-149',
    name: 'حليب البندق',
    calories: 60,
    protein: 1.5,
    carbs: 2.5,
    fat: 5.5,
    category: 'substitute'
  },
  {
    id: 'dairy-150',
    name: 'حليب الفستق',
    calories: 65,
    protein: 2.5,
    carbs: 3,
    fat: 5,
    category: 'substitute'
  }
];