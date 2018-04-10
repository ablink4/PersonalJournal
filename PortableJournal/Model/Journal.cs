using System.IO;
using System.Collections.Generic;
using System.ComponentModel;
using PortableJournal.Helpers;

namespace PortableJournal.Model
{
    class Journal : ObservableObject
    {
        private FileInfo _journalFile;  // is this actually the type that I want?
        private List<JournalEntry> _entries;

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

        public void Open()
        {

        }

        public void Save()
        {

        }

        public void Close()
        {
            
        }

        public event PropertyChangedEventHandler PropertyChanged;

        internal void RaisePropertyChanged(string prop)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(prop));
            }
        }
    }
}
