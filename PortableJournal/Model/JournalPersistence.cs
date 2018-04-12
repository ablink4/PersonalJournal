using System.Xml.Serialization;
using System.IO;

namespace PortableJournal.Model
{
    public static class JournalPersistence
    {
        public static void Store(Journal journalToStore, string filename)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Journal));
            using (StreamWriter writer = new StreamWriter(filename))
            {
                serializer.Serialize(writer, journalToStore);
            }
        }

        // should this be an object, or a Journal object?  It IS called JournalPersistence, right?
        public static Journal Retrieve(string filename)
        {
            Journal retrievedJournal;

            XmlSerializer serializer = new XmlSerializer(typeof(Journal));
            using (StreamReader reader = new StreamReader(filename))
            {
                retrievedJournal = serializer.Deserialize(reader) as Journal;
            }

            return retrievedJournal;
        }
    }
}
