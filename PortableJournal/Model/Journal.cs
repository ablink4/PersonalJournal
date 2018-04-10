using System.IO;
using System.Collections.Generic;
using System.Xml.Serialization;
using PortableJournal.Helpers;

namespace PortableJournal.Model
{
    class Journal : ObservableObject
    {
        private FileInfo _journalFile;  // is this actually the type that I want?
        private List<JournalEntry> _entries;

        public Journal() { }

        public Journal(string name)  // does it also need a location?  Or does it need a name at all?  ...hm.
        {
            _journalFile = new FileInfo(name);
            _entries = new List<JournalEntry>();
        }

        public string Name
        {
            get
            {
                return _journalFile.Name;
            }
        }

        /// <summary>
        /// Opens a Journal from an existing journal file and returns the Journal
        /// instance
        /// </summary>
        /// <returns></returns>
        public static Journal OpenExistingJournal(string journalFileName)
        {
            Journal openedJournal = new Journal(journalFileName);
            // open the journal file, read its contents, parse them, and then
            // return the Journal instance.

            return openedJournal;
        }

        public void Save()
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Journal));
            using (StreamWriter writer = new StreamWriter(Name))
            {
                serializer.Serialize(writer, this);
            }
            
        }

        public void Close()
        {
            
        }

        public void CreateNewEntry()  
        {

        }
    }
}
