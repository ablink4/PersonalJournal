using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Win32;
using PortableJournal.Helpers;
using PortableJournal.Model;

// thought: does it make sense to have a Journal instance, and set it based on the result of either
// New or Open?  => it does to me.  Does that mean that Open needs to return an instance of Journal?
// that seems odd, doesn't it?  It definitely implies that Open needs to be a static method, which...
// also doesn't make a lot of sense to me (right?)  Maybe it makes sense, just not with the terminology
// that I've been using, yeah?

namespace PortableJournal.ViewModel
{
    class ViewModelMain : ObservableObject
    {
        private Journal _activeJournal; // will be null until New() or Open() is called

        // TEMP: these are all just for laying out the View
        private string _journalName;
        private string _entryName;
        private string _entryText;
        private DateTime _entryDate;
        private List<string> _entriesList; 

        public ViewModelMain()
        {
            // TEMP: these are all just for laying out the View
            _entryText = string.Empty;
            _entriesList = new List<string>();
            for(int i = 0; i < 10; i++)
            {
                _entriesList.Add(String.Format("Entry {0}", i + 1));
            }
            _journalName = "Test Journal";
            _entryName = "Entry 1";
            _entryDate = DateTime.Now;
            // end TEMP
        }

        public Journal ActiveJournal
        {
            get
            {
                if(_activeJournal == null)
                {
                    _activeJournal = new Journal("idunno.txt");
                    // what do I do here?  I don't want to create a blank one, right?
                    // sigh
                }
                return _activeJournal;
            }
            private set // is private the correct access here?
            {
                _activeJournal = value;
            }
        }

        public string JournalName
        {
            get
            {
                return _journalName;
            }
            set
            {
                _journalName = value;
                RaisePropertyChanged("JournalName");
            }
        }

        public string EntryName
        {
            get
            {
                return _entryName;
            }
            set
            {
                _entryName = value;
                RaisePropertyChanged("EntryName");
            }
        }

        public DateTime EntryDate
        {
            get
            {
                return _entryDate;
            }
            set
            {
                _entryDate = value;
                RaisePropertyChanged("EntryDate");
            }
        }

        public string EntryText
        {
            get
            {
                return _entryText;
            }
            set
            {
                _entryText = value;
                RaisePropertyChanged("EntryText");
            }
        }

        public List<string> EntriesList
        {
            get
            {
                return _entriesList;
            }
            set
            {
                _entriesList = value;
                RaisePropertyChanged("EntriesList");
            }
        }

        public RelayCommand ExitCommand
        {
            get
            {
                return new RelayCommand(ExitApplication);
            }
        }

        void ExitApplication(object parameter)
        {
            System.Windows.Application.Current.Shutdown();
        }

        public RelayCommand SaveCommand
        {
            get
            {
                return new RelayCommand(SaveEntry);
            }
        }

        void SaveEntry(object parameter)
        {
            SaveFileDialog fileChooser = new SaveFileDialog();
            fileChooser.Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*";
            fileChooser.AddExtension = true;

            Nullable<bool> result = fileChooser.ShowDialog();

            if(result == true)
            {
                ActiveJournal.Save(); 

                // TEMP: just to demonstrate basic functionality until it's ready from Journal
                using (StreamWriter writer = new StreamWriter(fileChooser.FileName))
                {
                    writer.WriteLine(EntryText);
                }
                // End TEMP
            }
        }

        public RelayCommand OpenCommand
        {
            get
            {
                return new RelayCommand(OpenEntry);
            }
        }

        void OpenEntry(object parameter)
        {
            OpenFileDialog fileChooser = new OpenFileDialog();
            fileChooser.Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*";
            fileChooser.CheckFileExists = true;
            
            Nullable<bool> result = fileChooser.ShowDialog();

            if (result == true)
            {
                string filename = fileChooser.FileName;

                ActiveJournal = Journal.OpenExistingJournal(filename);

                // TEMP: just to demonstrate basic functionality until it's ready from Journal
                using (StreamReader reader = new StreamReader(filename))
                {
                    EntryText = reader.ReadToEnd();
                }
                // End TEMP
            }
        }

        public RelayCommand CloseCommand
        {
            get
            {
                return new RelayCommand(CloseEntry);
            }
        }

        void CloseEntry(object parameter)
        {
            ActiveJournal.Close();

            // TEMP: just to demonstrate basic functionality for the View
            EntryText = String.Empty; 
            // End TEMP
        }

        public RelayCommand NewEntryCommand
        {
            get
            {
                return new RelayCommand(CreateNewEntry);
            }
        }

        void CreateNewEntry(object parameter)
        {
            ActiveJournal.CreateNewEntry();
        }

        public RelayCommand NewJournalCommand
        {
            get
            {
                return new RelayCommand(CreateJournal);
            }
        }

        void CreateJournal(object parameter)
        {
            // TODO: this will need to be passed a name          
            string filename = "TBD";
            ActiveJournal = new Journal(filename);
            // probably need to call something to initialize the Journal here as well, right?
            // either that, or do it automatically in Journal...
        }
    }
}
