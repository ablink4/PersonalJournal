using System;
using System.Collections.Generic;
using PortableJournal.Helpers;

namespace PortableJournal.Model
{
    public class Journal : ObservableObject
    {
        private bool _isOpen; // this is a total hack
        private int _id;
        private string _name;
        private string _journalType;
        private DateTime _accessedDate;
        private List<JournalEntry> _entries;

        public Journal() { }

        public bool IsOpen
        {
            get
            {
                return _isOpen;
            }
            set
            {
                _isOpen = value;
                RaisePropertyChanged("IsOpen");
            }
        }

        public int Id
        {
            get
            {
                return _id;
            }
            set
            {
                _id = value;
                RaisePropertyChanged("Id");
            }
        }

        public string Name
        {
            get
            {
                return _name ?? string.Empty;
            }
            set
            {
                _name = value;
                RaisePropertyChanged("Name");
            }
        }

        public string JournalType
        {
            get
            {
                return _journalType ?? string.Empty;
            }
            set
            {
                _journalType = value;
                RaisePropertyChanged("JournalType");
            }
        }

        public DateTime AccessedDate
        {
            get
            {
                return _accessedDate;
            }
            set
            {
                _accessedDate = value;
                RaisePropertyChanged("AccessedDate");
            }
        }

        public List<JournalEntry> Entries
        {
            get
            {
                if(_entries == null)
                {
                    _entries = new List<JournalEntry>();
                }

                return _entries;
            }
            set
            {
                _entries = value;
                RaisePropertyChanged("Entries");
            }
        }

        // this might be the worst hack I have ever done
        public RelayCommand OpenJournalCommand
        {
            get
            {
                return new RelayCommand(OpenThisJournal);
            }
        }

        private void OpenThisJournal(object parameter)
        {
            JournalDatabase.SetAsOpenJournal(parameter as string);
        }
    }
}
