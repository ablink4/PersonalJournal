using System.Runtime.Serialization;
using System.IO;
using System.Xml;

namespace PortableJournal.Model
{
    public static class JournalPersistence
    {
        public static void Store(Journal journalToStore, string filename)
        {
            DataContractSerializer serializer = new DataContractSerializer(typeof(Journal));
            using (FileStream writer = new FileStream(filename, FileMode.Create))
            {
                serializer.WriteObject(writer, journalToStore);
            }
        }

        public static Journal Retrieve(string filename)
        {
            Journal retrievedJournal;

            using (FileStream reader = new FileStream(filename, FileMode.Open))
            {
                XmlDictionaryReader xmlReader = XmlDictionaryReader.CreateTextReader(reader, new XmlDictionaryReaderQuotas());
                DataContractSerializer serializer = new DataContractSerializer(typeof(Journal));
                retrievedJournal = serializer.ReadObject(xmlReader, true) as Journal;
                xmlReader.Close();
            }

            return retrievedJournal;
        }
    }
}
