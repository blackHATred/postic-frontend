export interface Post {
  id: number;
  text: string;
  platforms: string[] | null;
  pub_datetime: string | null;
  attachments: PostAttachment[];
  created_at: number;
  user_id: number;
  team_id: number;
}

export interface PostAttachment {
  id: number;
  file_path: string;
  file_type: string;
  uploaded_by_user_id: number;
  created_at: string;
}

export interface sendPost {
  text: string;
  attachments: number[];
  pub_datetime: string | undefined;
  platforms: string[];
  team_id: number;
}

export interface sendPostResult {
  post_id: number;
  status: string;
}

export interface PostEditReq {
  team_id: number;
  post_union_id: number;
  text: string;
}

export interface postStatusResults {
  status: {
    post_id: string;
    operation: string;
    platform: string;
    status: 'success' | 'error' | 'pending';
    err_message: string;
    created_at: string;
  }[];
}

export interface UploadResult {
  file_id: string;
  // filename: string;
  // size: number;
  // url: string;
}

export interface GenerateTextResult {
  text: string;
}

export interface GeneratePostResult {
  text: string;
  images: string[];
}

export interface FixPostReq {
  team_id: number;
  text: string;
}

export interface GeneratePostReq {
  team_id: number;
  query: string;
}

export interface FixPostResult {
  text: string;
  status?: string;
}

export const mockFixResult: FixPostResult = {
  text: 'Он такой очаровашка, прям как мои любимые подписчики! 🐱❤️',
};

export const mockGenerateTextResult = {
  text: 'Привет всем! Я хочу похвастаться моим милым котиком! Он такой очаровашка, прям как мои любимые подписчики! 🐱❤️',
};

export const mockGeneratePostResult: GeneratePostResult = {
  text: 'Всё-таки, пельмени. Я тут, честно говоря, очень увлекся. Вычитал эту историю про чучвару, про бешбармак… И понимаю, что всё, что мы едим, – это эволюция, история. Как будто пельмени не просто еда, а какой-то живой организм, который менялся под влиянием нужд людей. \n\nЗнаете, раньше я думал, что кулинария – это какая-то священная наука, где есть строгие правила и рецепты, которые нельзя нарушать. А тут… тут всё проще. Пельмени – это, по сути, отголосок древнего обмена, стремления сытнуть, чтобы выжить.  \n\nЧто-то вроде это… как будто я открыл секрет, о котором давно знали.  \n\nНачал думать, а что если приготовить их по-настоящему, как это делали в Узбекистане? Больше лука, зиры, кориандра.  Подумал, а что, если попробовать сделать тесто из твердых сортов пшеницы?  Пока не решился на полную катушку, но теперь точно хочу попробовать. \n\nИнтересно, а вы когда-нибудь задумывались об этом?  Как история еды влияет на то, что мы едим?',
  images: [
    'https://ic.pics.livejournal.com/stalic/2762948/2293407/2293407_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2292900/2292900_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2294582/2294582_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2294904/2294904_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2295220/2295220_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2295543/2295543_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2295586/2295586_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2295835/2295835_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2296319/2296319_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2296790/2296790_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2297083/2297083_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2296482/2296482_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2297474/2297474_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2297751/2297751_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2297945/2297945_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2298366/2298366_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2298369/2298369_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2298825/2298825_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2299068/2299068_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2299223/2299223_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2294147/2294147_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2299576/2299576_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2299831/2299831_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2300022/2300022_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2300399/2300399_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2293127/2293127_original.jpg',
    'https://ic.pics.livejournal.com/stalic/2762948/2293711/2293711_original.jpg',
  ],
};
