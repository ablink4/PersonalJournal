using System.IO;
using System.Collections.Generic;
using System.Runtime.Serialization;
using PortableJournal.Helpers;

namespace PortableJournal.Model
{
    [DataContract]
    public class Journal : ObservableObject
    {
        [DataMember]
        private FileInfo _journalFile;  // is this actually the type that I want?
        [DataMember]
        private List<JournalEntry> _entries;

        private int _selectedEntryIndex;

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

        public int SelectedEntryIndex
        {
            get
            {
                return _selectedEntryIndex;
            }
            set
            {
                _selectedEntryIndex = value;
                RaisePropertyChanged("SelectedEntryIndex");
                RaisePropertyChanged("SelectedEntry"); // update the selected entry when the index changes
            }
        }

        public JournalEntry SelectedEntry
        {
            get
            {
                return _entries[SelectedEntryIndex]; 
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
            JournalPersistence.Store(this, Name);            
        }

        public void Close()
        {
            
        }

        public void CreateNewEntry()  
        {

        }
    }
}
