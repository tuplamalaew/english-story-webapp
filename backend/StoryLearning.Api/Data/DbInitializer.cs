using Microsoft.EntityFrameworkCore;
using StoryLearning.Api.Models;

namespace StoryLearning.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            // Only seed if no stories exist
            if (context.Stories.Any())
            {
                return;
            }

            // Seed initial data
            var stories = new Story[]
            {
                new Story
                {
                    Title = "Oliver and the Golden Carrot",
                    Content = @"
Once upon a time, in a lush green forest, there lived a curious little rabbit named Oliver. 
Oliver loved to explore every nook and cranny of his home. 
One sunny morning, he discovered a mysterious path he had never seen before. 
Excited by the prospect of adventure, he hopped along the trail, his nose twitching with anticipation.
As he ventured deeper, he encountered a wise old owl perched on a sturdy branch.
""Where are you going, little one?"" hooted the owl.
""I'm on a journey to find the legendary Golden Carrot!"" declared Oliver bravely.
The owl chuckled effectively. ""That is a myth, but the journey itself is the treasure.""
Oliver pondered these words but continued his quest, eager to prove the legends true.
",
                    Translation = @"
กาลครั้งหนึ่งนานมาแล้ว ในป่าอันเขียวชอุ่ม มีกระต่ายน้อยอยากรู้อยากเห็นชื่อโอลิเวอร์อาศัยอยู่ 
โอลิเวอร์รักการสำรวจทุกซอกทุกมุมของบ้าน 
เช้าวันหนึ่งที่สดใส เขาได้พบกับเส้นทางลึกลับที่เขาไม่เคยเห็นมาก่อน 
ตื่นเต้นกับโอกาส / ความหวังแห่งการผจญภัย เขากระโดดไปตามทาง จมูกของเขาขยับด้วยความคาดหวัง
เมื่อเขากล้าเสี่ยงเข้าไปลึกขึ้น เขาได้พบกับนกฮูกเฒ่าผู้ชาญฉลาดเกาะอยู่บนกิ่งไม้ที่แข็งแรง / ทนทาน
""เจ้ากำลังจะไปไหน เจ้าตัวเล็ก?"" นกฮูกร้องทัก
""ฉันกำลังเดินทางเพื่อตามหาแครอททองคำที่เป็นตำนาน!"" โอลิเวอร์ประกาศอย่างกล้าหาญ
นกฮูกหัวเราะเบาๆ ""นั่นเป็นเพียงความเชื่อผิดๆ / ตำนาน แต่การเดินทางนั่นแหละคือสมบัติ""
โอลิเวอร์ครุ่นคิดคำพูดเหล่านี้ แต่ก็ยังคงทำการแสวงหา / ภารกิจของเขาต่อไป กระตือรือร้นที่จะพิสูจน์ว่าตำนานเป็นจริง
",
                    DifficultyLevel = "Easy",
                    Genre = "Adventure",
                    Vocabularies = new List<Vocabulary>
                    {
                        new() { Word = "lush", Translation = "เขียวชอุ่ม", Definition = "Growing luxuriantly", ExampleSentence = "The garden was lush with flowers.", ExampleTranslation = "สวนเขียวชอุ่มไปด้วยดอกไม้", Category = "Description", PartOfSpeech = "adj.", StoryId = 1 },
                        new() { Word = "curious", Translation = "อยากรู้อยากเห็น", Definition = "Eager to know or learn something", ExampleSentence = "The curious cat looked into the box.", ExampleTranslation = "แมวขี้สงสัยมองเข้าไปในกล่อง", Category = "Personality", PartOfSpeech = "adj.", StoryId = 1 },
                        new() { Word = "explore", Translation = "สำรวจ", Definition = "Travel in or through (an unfamiliar country or area) in order to learn about or familiarize oneself with it", ExampleSentence = "We like to explore new places.", ExampleTranslation = "พวกเราชอบสำรวจสถานที่ใหม่ๆ", Category = "Action", PartOfSpeech = "v.", StoryId = 1 },
                        new() { Word = "mysterious", Translation = "ลึกลับ", Definition = "Difficult or impossible to understand, explain, or identify", ExampleSentence = "The dark cave was mysterious.", ExampleTranslation = "ถ้ำมืดดูลึกลับ", Category = "Description", PartOfSpeech = "adj.", StoryId = 1 },
                        new() { Word = "prospect", Translation = "โอกาส / ความหวัง", Definition = "The possibility or likelihood of some future event occurring", ExampleSentence = "The prospect of winning was exciting.", ExampleTranslation = "โอกาสที่จะชนะน่าตื่นเต้น", Category = "Abstract", PartOfSpeech = "n.", StoryId = 1 },
                        new() { Word = "adventure", Translation = "การผจญภัย", Definition = "An unusual and exciting, typically hazardous, experience or activity", ExampleSentence = "Climbing the mountain was a big adventure.", ExampleTranslation = "การปีนเขาเป็นการผจญภัยครั้งใหญ่", Category = "Activity", PartOfSpeech = "n.", StoryId = 1 },
                        new() { Word = "anticipation", Translation = "ความคาดหวัง", Definition = "The action of anticipating something; expectation or prediction", ExampleSentence = "She waited with anticipation.", ExampleTranslation = "เธอรอคอยด้วยความคาดหวัง", Category = "Emotion", PartOfSpeech = "n.", StoryId = 1 },
                        new() { Word = "ventured", Translation = "กล้าเสี่ยงเข้าไป", Definition = "Dare to do something or go somewhere that may be dangerous or unpleasant", ExampleSentence = "He ventured into the deep woods.", ExampleTranslation = "เขากล้าเสี่ยงเข้าไปในป่าลึก", Category = "Action", PartOfSpeech = "v.", StoryId = 1 },
                        new() { Word = "sturdy", Translation = "แข็งแรง / ทนทาน", Definition = "Strongly and solidly built", ExampleSentence = "The table is very sturdy.", ExampleTranslation = "โต๊ะตัวนี้แข็งแรงมาก", Category = "Description", PartOfSpeech = "adj.", StoryId = 1 },
                        new() { Word = "legendary", Translation = "ที่เป็นตำนาน", Definition = "Remarkable enough to be famous; very well known", ExampleSentence = "The hero was legendary.", ExampleTranslation = "ฮีโร่ผู้นั้นเป็นตำนาน", Category = "Description", PartOfSpeech = "adj.", StoryId = 1 },
                        new() { Word = "myth", Translation = "ความเชื่อผิดๆ / ตำนาน", Definition = "A traditional story, especially one concerning the early history of a people", ExampleSentence = "It is just an old myth.", ExampleTranslation = "มันเป็นเพียงตำนานเก่าแก่", Category = "Abstract", PartOfSpeech = "n.", StoryId = 1 },
                        new() { Word = "treasure", Translation = "สมบัติ", Definition = "Quantity of precious metals, gems, or other valuable objects", ExampleSentence = "They found buried treasure.", ExampleTranslation = "พวกเขาพบสมบัติที่ถูกฝังไว้", Category = "Object", PartOfSpeech = "n.", StoryId = 1 },
                        new() { Word = "pondered", Translation = "ครุ่นคิด", Definition = "Think about (something) carefully, especially before making a decision or reaching a conclusion", ExampleSentence = "He pondered the difficult question.", ExampleTranslation = "เขาครุ่นคิดถึงคำถามที่ยาก", Category = "Action", PartOfSpeech = "v.", StoryId = 1 },
                        new() { Word = "quest", Translation = "การแสวงหา / ภารกิจ", Definition = "A long or arduous search for something", ExampleSentence = "The knight went on a quest.", ExampleTranslation = "อัศวินออกเดินทางในภารกิจ", Category = "Activity", PartOfSpeech = "n.", StoryId = 1 }
                    }
                }
            };

            context.Stories.AddRange(stories);
            context.SaveChanges();
            
            // Also seed demo progress
            SeedDemoProgress(context);
        }

        private static void SeedDemoProgress(AppDbContext context)
        {
            if (context.DailyProgresses.Any()) return;

            var today = DateTime.UtcNow.Date;
            
            // Mock 5 days of history
            context.DailyProgresses.AddRange(
                new Models.DailyProgress { Date = today.AddDays(-4), IsCompleted = true, WordsLearnedCount = 10 },
                new Models.DailyProgress { Date = today.AddDays(-3), IsCompleted = true, WordsLearnedCount = 15 },
                new Models.DailyProgress { Date = today.AddDays(-2), IsCompleted = false, WordsLearnedCount = 2 }, // Missed day
                new Models.DailyProgress { Date = today.AddDays(-1), IsCompleted = true, WordsLearnedCount = 12 }
            );
            context.SaveChanges();
        }
    }
}
