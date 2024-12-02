<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241114194810 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report_user DROP FOREIGN KEY FK_FEBF3BB24BD2A4C0');
        $this->addSql('ALTER TABLE report_user DROP FOREIGN KEY FK_FEBF3BB2A76ED395');
        $this->addSql('DROP TABLE report_user');
        $this->addSql('ALTER TABLE report ADD reviewed_by_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784E03A844A FOREIGN KEY (reviewed_by_user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_C42F7784E03A844A ON report (reviewed_by_user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE report_user (report_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_FEBF3BB24BD2A4C0 (report_id), INDEX IDX_FEBF3BB2A76ED395 (user_id), PRIMARY KEY(report_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE report_user ADD CONSTRAINT FK_FEBF3BB24BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report_user ADD CONSTRAINT FK_FEBF3BB2A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784E03A844A');
        $this->addSql('DROP INDEX IDX_C42F7784E03A844A ON report');
        $this->addSql('ALTER TABLE report DROP reviewed_by_user_id');
    }
}
