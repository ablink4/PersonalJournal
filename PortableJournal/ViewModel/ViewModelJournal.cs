using PortableJournal.Helpers;
using PortableJournal.Model;

namespace PortableJournal.ViewModel
{
    public class ViewModelJournal : ObservableObject, IViewModel
    {
        private string _name;

        public ViewModelJournal() { }

        public string Name
        {
            get
            {
                return _name ?? string.Empty;
            }
        }

        public string JournalName
        {
            get
            {
                return JournalDatabase.GetOpenJournal().Name;
            }
        }

        public string JournalContent
        {
            get
            {
                // everything about this is wrong
                Journal activeJournal = JournalDatabase.GetOpenJournal();

                if (activeJournal.Entries == null)
                {
                    activeJournal.Entries = new System.Collections.Generic.List<JournalEntry>();
                }
                if(activeJournal.Entries.Count == 0)
                { 
                    activeJournal.Entries.Add(new JournalEntry("New Entry"));
                    activeJournal.Entries[0].FullText = "This is some placeholder text.";
                    JournalDatabase.UpdateJournal(activeJournal); // update with the new entries
                }                

                return activeJournal.Entries[0].FullText;
            }
            set
            {
                // if the added character is whitespace, it won't be saved... (FIXME)
                Journal activeJournal = JournalDatabase.GetOpenJournal();
                activeJournal.Entries[0].FullText = value;
                JournalDatabase.UpdateJournal(activeJournal);
                RaisePropertyChanged("JournalContent");
            }
        }

    }
}
