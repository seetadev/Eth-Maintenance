#!/usr/bin/perl
use strict;
use warnings;
use Cwd;
use File::Path qw/rmtree/;

my $app_dir = shift or usage();
my $dev_dir = shift or usage();
unless (-d $app_dir) {
    die "No such directory: $app_dir\n";
}
unless (-d $dev_dir) {
    die "No such directory: $dev_dir\n";
}

print "$app_dir => $dev_dir\n";

my @files = glob("$dev_dir/*");
for my $f (@files) {
    (my $basename = $f) =~ s#.+/##;
    my $app_file = "$app_dir/$basename";
    if (-d $app_file) {
        rmtree $app_file or die "Couldn't rmtree $app_file: $!";
    }
    if (-e $app_file) {
        unlink $app_file or die "Couldn't unlink $app_file: $!";
    }
    
    print "Symlinking $basename\n";
    symlink "$dev_dir/$basename" => $app_file 
        or die "Can't symlink $dev_dir/$basename => $app_file: $!";
}

exit;

sub usage {
    die <<EOT;
USAGE: $0 <activity directory> <dev directory>

This tool creates symlinks from the Activity directory into the current
working directory.  Any file or directory found in the dev directory
will be symlinked to the Activity directory.

EOT
}
